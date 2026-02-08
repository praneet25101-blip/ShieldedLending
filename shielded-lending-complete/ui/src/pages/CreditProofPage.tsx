import { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function CreditProofPage() {
  const [creditScore, setCreditScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasProof, setHasProof] = useState(false);

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In production: call contract's submitCreditProof circuit
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasProof(true);
      alert('Credit proof submitted successfully!');
    } catch (error) {
      console.error('Failed to submit credit proof:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Credit Proof</h1>
        <p className="text-purple-200 text-lg">
          Get verified without revealing your actual credit score
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">How Zero-Knowledge Credit Proofs Work</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              1
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Share Your Score with a Verifier</h3>
              <p className="text-purple-200">
                You provide your credit score to a trusted verifier (like a credit bureau or authorized institution). 
                This happens off-chain and privately.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              2
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Verifier Creates ZK Proof</h3>
              <p className="text-purple-200">
                The verifier generates a zero-knowledge proof that your score is above a minimum threshold 
                (e.g., 600+) WITHOUT revealing the actual number. This proof is cryptographically signed.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              3
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Proof Stored On-Chain</h3>
              <p className="text-purple-200">
                Only a cryptographic commitment (hash) is stored on the blockchain. Your actual credit score 
                never touches the blockchain and remains completely private.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              4
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Lenders Verify Without Seeing</h3>
              <p className="text-purple-200">
                When you request a loan, lenders can verify you meet the credit requirement 
                without ever seeing your actual score. Perfect privacy!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantees */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-3">Privacy Guarantees</h3>
            <ul className="space-y-2 text-green-200 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Your actual credit score is <strong>never</strong> stored on the blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Lenders only see "Proven: score ≥ X" - not your real number</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>The proof is cryptographically secure and cannot be forged</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Only you and the verifier know your actual score</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Simulation Form (for demo purposes) */}
      <form onSubmit={handleSubmitProof} className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Submit Credit Proof (Demo)</h2>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-200 text-sm">
            <strong>Demo Mode:</strong> In production, this would be done by a trusted credit verifier. 
            For this demo, you can simulate the process directly.
          </div>
        </div>

        {!hasProof ? (
          <>
            <div className="space-y-6">
              <div>
                <label className="block text-purple-200 font-medium mb-2">
                  Your Credit Score (Private)
                </label>
                <input
                  type="number"
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value)}
                  placeholder="720"
                  min="300"
                  max="850"
                  required
                  className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition"
                />
                <p className="text-purple-300 text-sm mt-2">
                  This number will NOT be revealed to lenders. Only a proof that it's ≥ 600 will be created.
                </p>
              </div>

              {creditScore && parseInt(creditScore) < 600 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-red-200 text-sm">
                    Your credit score is below the minimum requirement (600). 
                    You won't be able to create loan requests with this score.
                  </div>
                </div>
              )}

              {creditScore && parseInt(creditScore) >= 600 && (
                <div className="bg-purple-900/50 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">What Will Be Stored On-Chain:</h3>
                  <div className="space-y-3 font-mono text-sm">
                    <div>
                      <span className="text-purple-400">Commitment Hash:</span>
                      <span className="text-white ml-2">0x7a3f2e...</span>
                    </div>
                    <div>
                      <span className="text-purple-400">Minimum Score Proven:</span>
                      <span className="text-green-400 ml-2">≥ 600</span>
                    </div>
                    <div>
                      <span className="text-purple-400">Actual Score:</span>
                      <span className="text-purple-300 ml-2">[HIDDEN - Never Stored]</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !creditScore || parseInt(creditScore) < 600}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition shadow-lg shadow-purple-500/20"
              >
                {submitting ? 'Creating Zero-Knowledge Proof...' : 'Submit Credit Proof'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Credit Proof Active!</h3>
            <p className="text-purple-200 mb-6">
              You can now create loan requests. Lenders will see that your credit score 
              meets the requirements without knowing the actual number.
            </p>
            <div className="bg-purple-900/50 border border-purple-500/30 rounded-lg p-6 max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-400">Status:</span>
                  <span className="text-green-400 font-semibold">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">Proof Valid Until:</span>
                  <span className="text-white">30 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">What Lenders See:</span>
                  <span className="text-white">Score ≥ 600</span>
                </div>
              </div>
            </div>
            <a
              href="/borrow"
              className="inline-block mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Create Loan Request
            </a>
          </div>
        )}
      </form>

      {/* FAQ */}
      <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <details className="group">
            <summary className="text-white font-semibold cursor-pointer hover:text-purple-300 transition">
              Who can be a trusted verifier?
            </summary>
            <p className="text-purple-200 mt-2 pl-4">
              Trusted verifiers are institutions like credit bureaus, banks, or licensed credit agencies 
              that have been whitelisted by the platform. They have the authority to verify credit scores.
            </p>
          </details>

          <details className="group">
            <summary className="text-white font-semibold cursor-pointer hover:text-purple-300 transition">
              How long does a credit proof last?
            </summary>
            <p className="text-purple-200 mt-2 pl-4">
              Credit proofs are valid for 30 days. After that, you'll need to request a new proof 
              to ensure your creditworthiness information is current.
            </p>
          </details>

          <details className="group">
            <summary className="text-white font-semibold cursor-pointer hover:text-purple-300 transition">
              Can I fake my credit score?
            </summary>
            <p className="text-purple-200 mt-2 pl-4">
              No. The proof is cryptographically signed by trusted verifiers. Any attempt to forge 
              or modify the proof will be detected and rejected by the smart contract.
            </p>
          </details>

          <details className="group">
            <summary className="text-white font-semibold cursor-pointer hover:text-purple-300 transition">
              What if my credit score improves?
            </summary>
            <p className="text-purple-200 mt-2 pl-4">
              You can request a new credit proof at any time. Your new, improved score will be verified 
              and you'll be able to access better loan terms.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
