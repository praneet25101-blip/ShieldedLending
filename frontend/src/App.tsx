import React, { useState, useRef, useEffect } from 'react'
import { MidnightDAppAPI } from './midnight-api.stub'

function toHex(bytes: Uint8Array) {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Logo Component
function ShieldedLendingLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 12 }}>
      <defs>
        <linearGradient id="shieldGradient" x1="8" y1="4" x2="44" y2="48">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="glowGradient" x1="26" y1="8" x2="26" y2="42">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      
      {/* Outer Shield with gradient */}
      <path d="M26 3L10 11V24C10 36 26 46 26 46C26 46 42 36 42 24V11L26 3Z" 
            fill="url(#shieldGradient)" stroke="url(#glowGradient)" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Inner glow layer */}
      <path d="M26 6L12 13V24C12 34.8 26 43.2 26 43.2C26 43.2 40 34.8 40 24V13L26 6Z" 
            fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.4"/>
      
      {/* Central lock symbol - more minimalist */}
      <g opacity="0.95">
        {/* Lock body */}
        <rect x="18" y="21" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="1.8"/>
        
        {/* Lock shackle */}
        <path d="M20 21V17C20 13.7 22.7 11 26 11C29.3 11 32 13.7 32 17V21" 
              fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        
        {/* Lock keyhole dot */}
        <circle cx="26" cy="29" r="1.5" fill="white"/>
      </g>
      
      {/* Accent dots for security/encryption feel */}
      <circle cx="15" cy="18" r="1" fill="#60a5fa" opacity="0.6"/>
      <circle cx="37" cy="20" r="1" fill="#a78bfa" opacity="0.6"/>
      <circle cx="14" cy="35" r="0.8" fill="#a78bfa" opacity="0.5"/>
      <circle cx="38" cy="33" r="0.8" fill="#60a5fa" opacity="0.5"/>
    </svg>
  )
}

interface Loan {
  id: string
  amount: bigint
  status: 'pending' | 'approved' | 'active'
  minCreditScore: number
}

export default function App() {
  // Wallet & Auth
  const [wallet, setWallet] = useState<string | null>(null)

  // Credit Score Management
  const [creditScore, setCreditScore] = useState<number>(750)
  const [inputScore, setInputScore] = useState<string>('750')
  const [commitment, setCommitment] = useState<string | null>(null)
  const [secretBytes, setSecretBytes] = useState<Uint8Array | null>(null)

  // Loan Management
  const [loanAmount, setLoanAmount] = useState<string>('1000')
  const [loans, setLoans] = useState<Loan[]>([])
  const [activeContractAddress, setActiveContractAddress] = useState<string | null>(null)

  // Credit Verification
  const [minScoreToProve, setMinScoreToProve] = useState<string>('700')
  const [proofResult, setProofResult] = useState<string | null>(null)

  // UI State
  const [logs, setLogs] = useState<string[]>([])
  const midnightApi = useRef<MidnightDAppAPI>(new MidnightDAppAPI())
  const [useRealApi, setUseRealApi] = useState<boolean>(false)

  const addLog = (s: string) => {
    setLogs(l => [...l, `${new Date().toLocaleTimeString()} - ${s}`])
  }

  const connectWallet = async () => {
    // @ts-ignore
    const midnight = window.midnight
    if (!midnight || !midnight.mnLace) throw new Error('Lace extension not found')

    const wallet = midnight.mnLace
    const walletAPI = wallet.enable
      ? await wallet.enable()
      : await wallet.connect('undeployed')

    const walletState = walletAPI?.state ? await walletAPI.state() : null
    const uris = wallet.serviceUriConfig ? await wallet.serviceUriConfig() : null
    const address =
      walletState?.address ||
      walletState?.state?.address ||
      (await walletAPI.getShieldedAddresses?.())?.shieldedAddress ||
      null

    return { walletAPI, uris, address }
  }

  // Dynamic toggle to switch between stub and real Midnight API
  const toggleApi = async (enableReal: boolean) => {
    setUseRealApi(enableReal)
    addLog(`${enableReal ? 'Switching to real' : 'Switching to stub'} Midnight API...`)

    if (enableReal) {
      try {
        const mod = await import('./midnight-api')
        // @ts-ignore
        midnightApi.current = new mod.MidnightDAppAPI()
        addLog('✓ Real Midnight API module loaded')
        // If wallet already present, initialize the API with it
        if (wallet) {
          try {
            const { walletAPI, uris } = await connectWallet()
            await midnightApi.current.initialize(walletAPI, uris)
            addLog('✓ Real Midnight API initialized with wallet')
          } catch (err: any) {
            addLog('⚠ Real API init: ' + (err?.message || err))
          }
        }
      } catch (err: any) {
        addLog('✗ Failed to load real API: ' + (err?.message || err))
        setUseRealApi(false)
      }
    } else {
      try {
        const stub = await import('./midnight-api.stub')
        // @ts-ignore
        midnightApi.current = new stub.MidnightDAppAPI()
        addLog('✓ Switched to stub API')
      } catch (err: any) {
        addLog('✗ Failed to revert to stub: ' + (err?.message || err))
      }
    }
  }

  // Convert various address formats (0x hex, mn_addr_*, or library-decoded) to 32-byte Uint8Array
  const addressToBytes = async (addr?: string): Promise<Uint8Array> => {
    if (!addr) return new Uint8Array(32)
    // hex form
    if (addr.startsWith('0x')) {
      const h = addr.replace(/^0x/, '').padStart(64, '0')
      return new Uint8Array(h.match(/.{2}/g)!.map(b => parseInt(b, 16)))
    }

    // Try using address-format library if available
    try {
      const mod = await import('@midnight-ntwrk/wallet-sdk-address-format')
      const tryFns = ['decodeAddress', 'decodeShieldedAddress', 'decode', 'parseAddress', 'addressToBytes']
      for (const fn of tryFns) {
        if (typeof (mod as any)[fn] === 'function') {
          const out = (mod as any)[fn](addr)
          if (out instanceof Uint8Array) return out
          if (Array.isArray(out)) return new Uint8Array(out)
          if (out && out.publicKey) {
            if (out.publicKey instanceof Uint8Array) return out.publicKey
            if (typeof out.publicKey === 'string') return await addressToBytes(out.publicKey)
          }
          if (typeof out === 'string' && out.startsWith('0x')) return await addressToBytes(out)
        }
      }
    } catch (e: any) {
      addLog('⚠ Address decode lib not available or failed: ' + (e?.message || e))
    }

    addLog('⚠ Could not decode address to bytes; returning zeroed 32-byte array')
    return new Uint8Array(32)
  }

  // Auto-scroll logs
  useEffect(() => {
    const logContainer = document.getElementById('log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, [logs])

    const connectLace = async () => {
    addLog('Attempting to connect to Lace wallet...')
    try {
      const { walletAPI, uris, address } = await connectWallet()
      if (!address) throw new Error('Could not resolve wallet address')
      setWallet(address)
      addLog(`✓ Connected wallet: ${address.substring(0, 12)}...`)

      try {
        await midnightApi.current.initialize(walletAPI, uris)
        addLog('✓ Midnight API initialized')
      } catch (err: any) {
        addLog('⚠ API init: ' + (err?.message || err))
      }
    } catch (err: any) {
      addLog('✗ Connection failed: ' + (err?.message || err))
    }
  }

  // Credit Score: Hash the score locally with ZK commitment
  const registerCreditScore = async () => {
    const score = parseInt(inputScore)
    if (isNaN(score) || score < 300 || score > 850) {
      addLog('✗ Credit score must be between 300-850')
      return
    }

    // Create a secret that includes the score (in production, use a proper ZK prover)
    const secret = new Uint8Array(32)
    const scoreBuffer = new TextEncoder().encode(`score:${score}`)
    secret.set(scoreBuffer.subarray(0, Math.min(scoreBuffer.length, 32)))
    
    const hash = await crypto.subtle.digest('SHA-256', secret)
    const hex = toHex(new Uint8Array(hash))
    
    setCommitment(hex)
    setSecretBytes(secret)
    setCreditScore(score)
    addLog(`✓ Credit score registered: ${score} (commitment: ${hex.substring(0, 16)}...)`)
  }

  const registerOnChain = async () => {
    if (!commitment || !secretBytes) {
      addLog('✗ Register a credit score first')
      return
    }

    if (!wallet) {
      addLog('⚠ Wallet not connected — storing locally')
      const ledger = JSON.parse(localStorage.getItem('p2p_sim_ledger') || '[]')
      if (!ledger.includes(commitment)) {
        ledger.push(commitment)
        localStorage.setItem('p2p_sim_ledger', JSON.stringify(ledger))
        addLog('✓ Commitment stored in local ledger')
      }
      return
    }

    try {
      const commitmentBytes = new Uint8Array(
        commitment.replace('0x', '').match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16))
      )
      const walletBytes = await addressToBytes(wallet)
      
      const res = await midnightApi.current.registerCredit(commitmentBytes, walletBytes)
      setActiveContractAddress(res.contractAddress)
      addLog(`✓ On-chain registration: ${res.txHash.substring(0, 12)}...`)
    } catch (err: any) {
      addLog('✗ Registration: ' + (err?.message || err))
    }
  }

  const createLoanRequest = async () => {
    const amount = BigInt(loanAmount)
    if (amount <= 0) {
      addLog('✗ Loan amount must be > 0')
      return
    }

    if (!commitment || !activeContractAddress) {
      addLog('✗ Register credit score first')
      return
    }

    try {
      const commitmentBytes = new Uint8Array(
        commitment.replace('0x', '').match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16))
      )
      const walletBytes = await addressToBytes(wallet)

      const res = await midnightApi.current.createLoanRequest(
        activeContractAddress,
        commitmentBytes,
        amount,
        walletBytes
      )

      const newLoan: Loan = {
        id: `loan-${Date.now()}`,
        amount,
        status: 'pending',
        minCreditScore: 650
      }
      setLoans(l => [...l, newLoan])
      addLog(`✓ Loan requested: $${amount} (ID: ${newLoan.id.substring(0, 12)}...)`)
    } catch (err: any) {
      addLog('✗ Loan request: ' + (err?.message || err))
    }
  }

  const proveCreditThreshold = async () => {
    if (!secretBytes || !activeContractAddress) {
      addLog('✗ Setup: register credit score & contract first')
      return
    }

    const minScore = parseInt(minScoreToProve)
    if (isNaN(minScore)) {
      addLog('✗ Enter a valid minimum score')
      return
    }

    try {
      const walletBytes = await addressToBytes(wallet)
      const res = await midnightApi.current.proveCreditThreshold(
        activeContractAddress,
        secretBytes,
        minScore,
        walletBytes
      )

      if (res.passed) {
        addLog(`✓ ZK Proof verified: Score meets ${minScore} threshold`)
        setProofResult(`✓ Verified: Your credit score meets the minimum of ${minScore}`)
        
        // Auto-approve loans that meet this score
        setLoans(loans =>
          loans.map(loan =>
            loan.status === 'pending' && loan.minCreditScore <= creditScore
              ? { ...loan, status: 'approved' }
              : loan
          )
        )
      } else {
        addLog(`✗ ZK Proof failed: Score below ${minScore}`)
        setProofResult(`✗ Failed: Your score does not meet the minimum of ${minScore}`)
      }
    } catch (err: any) {
      addLog('✗ Proof: ' + (err?.message || err))
    }
  }

  const approveLoan = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId)
    if (!loan) {
      addLog('✗ Loan not found')
      return
    }

    if (!secretBytes || !activeContractAddress || !wallet) {
      addLog('✗ Setup: register credit & connect wallet first')
      return
    }

    try {
      addLog(`⏳ Disbursing $${loan.amount} to wallet...`)

      // Convert wallet address to Uint8Array (32 bytes)
      const walletBytes = await addressToBytes(wallet)
      // Execute disbursement via smart contract
      const disburseResult = await midnightApi.current.approveAndDisburseLoan(
        activeContractAddress,
        secretBytes,
        minScoreToProve,
        walletBytes,
        loan.amount
      )

      if (disburseResult.success) {
        // Update loan status to active (funds transferred)
        setLoans(loans =>
          loans.map(l =>
            l.id === loanId 
              ? { ...l, status: 'active' } 
              : l
          )
        )
        addLog(`✓ Loan approved & disbursed!`)
        addLog(`  TX Hash: ${disburseResult.txHash.substring(0, 18)}...`)
        addLog(`  Amount: $${disburseResult.amount}`)
        addLog(`  Funds transferred to Lace wallet`)
      } else {
        addLog('✗ Disbursement failed')
      }
    } catch (err: any) {
      addLog('✗ Disbursement error: ' + (err?.message || err))
    }
  }

  const formatAmount = (amount: bigint) => {
    return (`$${amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={styles.logoSection}>
              <ShieldedLendingLogo />
              <h1 style={styles.title}>Shielded Lending</h1>
            </div>
            <div style={styles.apiToggle}>
              <button
                style={{...styles.apiToggleButton, ...(useRealApi ? {} : styles.apiToggleActive)}}
                onClick={() => toggleApi(false)}
              >
                Stub
              </button>
              <button
                style={{...styles.apiToggleButton, ...(useRealApi ? styles.apiToggleActive : {})}}
                onClick={() => toggleApi(true)}
              >
                Real
              </button>
            </div>
          </div>
          <p style={styles.subtitle}>Zero-Knowledge Credit Verification & Private Loan Management</p>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div style={styles.mainWrapper}>
        {/* Left Column - Wallet & Credit Setup */}
        <div style={styles.column}>
          {/* Wallet Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💳 Wallet</h2>
            {wallet ? (
              <div style={styles.walletConnected}>
                <span style={styles.badge}>✓ Connected</span>
                <code style={styles.address}>{wallet.substring(0, 20)}...{wallet.substring(wallet.length - 8)}</code>
              </div>
            ) : (
              <button onClick={connectLace} style={{ ...styles.button, ...styles.buttonPrimary }}>
                Connect Lace Wallet
              </button>
            )}
          </div>

          {/* Credit Score Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 Credit Score</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter your credit score (300–850):</label>
              <input
                type="number"
                min="300"
                max="850"
                value={inputScore}
                onChange={(e) => setInputScore(e.target.value)}
                style={styles.input}
              />
              <button onClick={registerCreditScore} style={{ ...styles.button, width: '100%', marginBottom: 8 }}>
                Register Score (Local)
              </button>
            </div>
            {commitment && (
              <div style={styles.infoBox}>
                <div style={{ marginBottom: 12 }}>
                  <div><strong>Current Score:</strong></div>
                  <div style={styles.scoreDisplay}>{creditScore}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div><strong style={{ fontSize: 12 }}>ZK Commitment:</strong></div>
                  <code style={{ ...styles.address, fontSize: 11 }}>{commitment.substring(0, 32)}...</code>
                </div>
                <button onClick={registerOnChain} style={{ ...styles.button, ...styles.buttonSecondary, width: '100%' }}>
                  Register On-Chain
                </button>
              </div>
            )}
          </div>

          {/* ZK Credit Proof Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🔐 ZK Verification</h2>
            <p style={styles.description}>
              Prove your score meets a threshold without revealing it.
            </p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Minimum score to prove:</label>
              <input
                type="number"
                min="300"
                max="850"
                value={minScoreToProve}
                onChange={(e) => setMinScoreToProve(e.target.value)}
                style={styles.input}
              />
              <button onClick={proveCreditThreshold} style={{ ...styles.button, ...styles.buttonSecondary, width: '100%' }}>
                Generate ZK Proof
              </button>
            </div>
            {proofResult && (
              <div style={{
                ...styles.infoBox,
                background: proofResult.startsWith('✓') ? '#d1fae5' : '#fee2e2',
                borderColor: proofResult.startsWith('✓') ? '#10b981' : '#ef4444',
                color: proofResult.startsWith('✓') ? '#047857' : '#991b1b',
                marginTop: 12
              }}>
                {proofResult}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Loans & Logs */}
        <div style={styles.column}>
          {/* Loan Management Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💰 Loan Management</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Loan amount ($):</label>
              <input
                type="number"
                min="100"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                style={styles.input}
              />
              <button onClick={createLoanRequest} style={{ ...styles.button, ...styles.buttonPrimary, width: '100%' }}>
                Request Loan
              </button>
            </div>

            {loans.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={styles.sectionTitle}>Your Loans ({loans.length})</h3>
                <div style={styles.loansList}>
                  {loans.map((loan) => (
                    <div key={loan.id} style={styles.loanCard}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.loanAmount}>{formatAmount(loan.amount)}</div>
                        <small style={{ color: '#94a3b8' }}>ID: {loan.id.substring(0, 14)}...</small>
                        <br />
                        <span style={{
                          ...styles.statusBadge,
                          background: loan.status === 'active' ? '#10b981' : loan.status === 'approved' ? '#f59e0b' : '#6366f1'
                        }}>
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                      {loan.status === 'approved' && (
                        <button onClick={() => approveLoan(loan.id)} style={{ ...styles.button, padding: '8px 12px', fontSize: 12 }}>
                          Activate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logs Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📋 Activity Log</h2>
            <div id="log-container" style={styles.logContainer}>
              {logs.length === 0 ? (
                <div style={styles.emptyLogs}>No activity yet</div>
              ) : (
                logs.map((l, i) => <div key={i} style={styles.logEntry}>{l}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#f1f5f9',
    minHeight: '100vh',
    padding: '20px',
  } as React.CSSProperties,

  header: {
    marginBottom: 40,
  },

  headerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    textAlign: 'center' as const,
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },

  apiToggle: {
    display: 'flex',
    flexDirection: 'column' as const,
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  apiToggleButton: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(148,163,184,0.12)',
    background: 'transparent',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: 12,
    marginBottom: 6,
  } as React.CSSProperties,

  apiToggleActive: {
    background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
    color: 'white',
    border: 'none',
  } as React.CSSProperties,

  title: {
    fontSize: 'clamp(28px, 5vw, 42px)',
    fontWeight: 700,
    margin: '0 0 12px 0',
    background: 'linear-gradient(120deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,

  subtitle: {
    fontSize: 'clamp(13px, 2vw, 15px)',
    color: '#cbd5e1',
    margin: 0,
  },

  mainWrapper: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: 24,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    }
  } as React.CSSProperties,

  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  } as React.CSSProperties,

  card: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: 12,
    padding: 24,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: '0 0 16px 0',
    color: '#60a5fa',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    margin: '0 0 16px 0',
    color: '#cbd5e1',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  description: {
    fontSize: 13,
    color: '#cbd5e1',
    margin: '0 0 16px 0',
    lineHeight: 1.5,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    display: 'block' as const,
    fontSize: 13,
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    padding: '12px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  button: {
    padding: '12px 16px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid #6366f1',
    borderRadius: 8,
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  buttonPrimary: {
    background: 'linear-gradient(120deg, #3b82f6, #6366f1)',
    border: 'none',
    color: 'white',
    fontWeight: 600,
  },

  buttonSecondary: {
    background: 'linear-gradient(120deg, #8b5cf6, #a78bfa)',
    border: 'none',
    color: 'white',
    fontWeight: 600,
  },

  walletConnected: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },

  badge: {
    display: 'inline-block',
    background: '#10b981',
    color: '#ecfdf5',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    width: 'fit-content',
  } as React.CSSProperties,

  address: {
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '12px',
    borderRadius: 8,
    fontSize: 11,
    color: '#94a3b8',
    wordBreak: 'break-all' as const,
    fontFamily: 'monospace',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  } as React.CSSProperties,

  scoreDisplay: {
    fontSize: 32,
    fontWeight: 700,
    color: '#60a5fa',
    margin: '8px 0',
  },

  infoBox: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid #3b82f6',
    borderRadius: 8,
    padding: 16,
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 12,
  } as React.CSSProperties,

  loansList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },

  loanCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  loanAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#60a5fa',
    marginBottom: 4,
  },

  statusBadge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8,
    color: 'white',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  logContainer: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    padding: 16,
    height: 300,
    overflowY: 'auto' as const,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#cbd5e1',
    lineHeight: 1.6,
  } as React.CSSProperties,

  logEntry: {
    marginBottom: 8,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },

  emptyLogs: {
    color: '#64748b',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    padding: 40,
  },
}






