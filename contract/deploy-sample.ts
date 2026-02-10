/**
 * Sample deploy script for local Midnight deployment.
 *
 * This is a template showing how to wire `deployContract` from
 * `@midnight-ntwrk/midnight-js-contracts`. It requires proper provider
 * initialization (wallet, proof provider, indexer, private-state provider)
 * which depends on your local node and Midnight SDK configuration.
 *
 * Fill in the TODOs below with your local endpoints / keys and run:
 *
 *   npx ts-node deploy-sample.ts
 *
 */

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { webcrypto as nodeWebcrypto } from 'node:crypto';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import * as zswap from '@midnight-ntwrk/zswap';
import { firstValueFrom } from 'rxjs';
import { mnemonicToSeedSync, validateMnemonic } from 'bip39';
import {
  BALANCE_TRANSACTION_TO_PROVE,
  NOTHING_TO_PROVE,
  TRANSACTION_TO_PROVE,
} from '@midnight-ntwrk/wallet-api';
import { Contract as LendingContract } from './src/managed/lending/contract/index.js';

// Replace with the compiled contract artifact exported by `compact`.
// In ESM, `__dirname` is not defined — derive it from `import.meta.url`.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const zkConfigPath = path.resolve(__dirname, './src/managed/lending');

// Ensure SecureRandom has a crypto provider in Node (required by wallet SDK).
if (!globalThis.crypto) {
  // @ts-ignore - Node's webcrypto matches Web Crypto API shape
  globalThis.crypto = nodeWebcrypto;
}

class MemoryPrivateStateProvider {
  private states = new Map<string, any>();
  private signingKeys = new Map<string, any>();

  async set(privateStateId: string, state: any) {
    this.states.set(privateStateId, state);
  }
  async get(privateStateId: string) {
    return this.states.get(privateStateId) ?? null;
  }
  async remove(privateStateId: string) {
    this.states.delete(privateStateId);
  }
  async clear() {
    this.states.clear();
  }
  async setSigningKey(address: any, signingKey: any) {
    this.signingKeys.set(String(address), signingKey);
  }
  async getSigningKey(address: any) {
    return this.signingKeys.get(String(address)) ?? null;
  }
  async removeSigningKey(address: any) {
    this.signingKeys.delete(String(address));
  }
  async clearSigningKeys() {
    this.signingKeys.clear();
  }
}

const parseNetworkId = (value?: string): zswap.NetworkId => {
  const v = (value || 'Undeployed').toLowerCase();
  if (v === 'devnet') return zswap.NetworkId.DevNet;
  if (v === 'testnet') return zswap.NetworkId.TestNet;
  if (v === 'mainnet') return zswap.NetworkId.MainNet;
  return zswap.NetworkId.Undeployed;
};

const readBinary = async (filePath: string) => new Uint8Array(await fs.readFile(filePath));

const makeFileZkConfigProvider = (rootDir: string) => {
  const zkirDir = path.join(rootDir, 'zkir');
  const keysDir = path.join(rootDir, 'keys');
  return {
    getZKIR: async (circuitId: string) => {
      const bzkir = path.join(zkirDir, `${circuitId}.bzkir`);
      const zkir = path.join(zkirDir, `${circuitId}.zkir`);
      try {
        return await readBinary(bzkir);
      } catch {
        return await readBinary(zkir);
      }
    },
    getProverKey: async (circuitId: string) =>
      readBinary(path.join(keysDir, `${circuitId}.prover`)),
    getVerifierKey: async (circuitId: string) =>
      readBinary(path.join(keysDir, `${circuitId}.verifier`)),
    get: async (circuitId: string) => ({
      circuitId,
      proverKey: await readBinary(path.join(keysDir, `${circuitId}.prover`)),
      verifierKey: await readBinary(path.join(keysDir, `${circuitId}.verifier`)),
      zkir: await readBinary(path.join(zkirDir, `${circuitId}.bzkir`)),
    }),
  };
};

const normalizeSeedHex32 = (seedHex: string) => {
  const hex = seedHex.trim().toLowerCase().replace(/^0x/, '');
  if (hex.length !== 64) {
    throw new Error('Seed hex must be exactly 32 bytes (64 hex characters).');
  }
  return hex;
};

async function main() {
  console.log('Sample deploy script — fill providers and wallet details');

  // Read configuration from environment variables. If missing, print guidance
  // and abort. Real deploy requires configured providers and a wallet key.
  const INDEXER_URI = process.env.MIDNIGHT_INDEXER_URI
  const INDEXER_WS = process.env.MIDNIGHT_INDEXER_WS
  const PROVER_SERVER_URI = process.env.MIDNIGHT_PROVER_SERVER_URI || process.env.MIDNIGHT_PROOF_PROVIDER_URL
  const NODE_URI = process.env.MIDNIGHT_NODE_URI || process.env.MIDNIGHT_SUBSTRATE_NODE_URI
  const NETWORK_ID = process.env.MIDNIGHT_NETWORK_ID

  const WALLET_PRIVATE_KEY = process.env.MIDNIGHT_WALLET_PRIVATE_KEY
  const WALLET_MNEMONIC = process.env.MIDNIGHT_WALLET_MNEMONIC
  const WALLET_SEED_HEX = process.env.MIDNIGHT_WALLET_SEED_HEX

  // Optional dry-run mode: initialize providers and exit before deploying
  const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1'

  const useWalletSdk = Boolean(WALLET_MNEMONIC || WALLET_SEED_HEX)

  // Example provider initialization using environment variables.
  // Replace these with concrete provider factories from your Midnight node SDK.
  const ZK_CONFIG_DIR = zkConfigPath
  const PRIVATE_STATE_DB_PATH = process.env.MIDNIGHT_PRIVATE_STATE_DB || './private-state.db'

  // A helper to print clear instructions without leaking secrets
  function explainAndExit(msg: string) {
    console.error(msg)
    console.error('\nSet the needed environment variables and provider endpoints, for example:')
    console.error(' MIDNIGHT_INDEXER_URI=https://indexer.example MIDNIGHT_INDEXER_WS=wss://indexer-ws.example MIDNIGHT_PROVER_SERVER_URI=https://prover.example MIDNIGHT_NODE_URI=https://node.example MIDNIGHT_WALLET_MNEMONIC="word1 word2 ..." npx tsx deploy-sample.ts')
    console.error(' Or: MIDNIGHT_WALLET_SEED_HEX=... (BIP32 seed hex) instead of mnemonic.')
    process.exit(1)
  }

  // Attempt to create real providers when possible; otherwise provide clear fallbacks.
  let proofProvider: any = null
  let zkConfigProvider: any = null
  let publicDataProvider: any = null
  let privateStateProvider: any = null
  let walletProvider: any = null
  let midnightProvider: any = null

  try {
    // Try to import provider helpers from Midnight packages when available.
    // These imports are optional — if not installed, we'll fall back to informative errors.
    try {
      // Example imports — adjust to your installed provider packages
      // const { httpClientProofProvider } = await import('@midnight-ntwrk/proof-provider-http')
      // const { NodeZkConfigProvider } = await import('@midnight-ntwrk/zk-config-node')
      // const { indexerPublicDataProvider } = await import('@midnight-ntwrk/indexer-client')
      // const { levelPrivateStateProvider } = await import('@midnight-ntwrk/private-state-level')
      // const { walletProviderFromPrivateKey } = await import('@midnight-ntwrk/wallet-provider')

      // If the concrete providers are available, construct them here. Example (pseudo):
      // proofProvider = httpClientProofProvider(PROOF_PROVIDER_URL)
      // zkConfigProvider = new NodeZkConfigProvider({ zkRoot: ZK_CONFIG_DIR })
      // publicDataProvider = indexerPublicDataProvider({ indexerUrl: INDEXER_URI, indexerWs: INDEXER_WS })
      // privateStateProvider = levelPrivateStateProvider({ path: PRIVATE_STATE_DB_PATH })
      // walletProvider = walletProviderFromPrivateKey(WALLET_PRIVATE_KEY)
    } catch (impErr) {
      // If imports fail, leave providers null — we'll detect and print instructions below.
    }
  } catch (err) {
    // ignore
  }

  // Validate minimal provider config for a deploy (we don't perform real wiring here).
  const missing = []
  if (!INDEXER_URI) missing.push('MIDNIGHT_INDEXER_URI')
  if (!INDEXER_WS) missing.push('MIDNIGHT_INDEXER_WS')

  if (useWalletSdk) {
    if (!PROVER_SERVER_URI) missing.push('MIDNIGHT_PROVER_SERVER_URI')
    if (!NODE_URI) missing.push('MIDNIGHT_NODE_URI')
    if (!WALLET_MNEMONIC && !WALLET_SEED_HEX) missing.push('MIDNIGHT_WALLET_MNEMONIC or MIDNIGHT_WALLET_SEED_HEX')
  } else {
    if (!WALLET_PRIVATE_KEY) missing.push('MIDNIGHT_WALLET_PRIVATE_KEY')
  }

  if (missing.length > 0 && !dryRun) {
    explainAndExit('Missing required environment variables: ' + missing.join(', '))
  }
  if (missing.length > 0 && dryRun) {
    console.warn('Dry-run: missing environment variables (placeholders will be used): ' + missing.join(', '))
  }

  if (useWalletSdk && !dryRun) {
    let seedHex: string;
    if (WALLET_SEED_HEX) {
      seedHex = normalizeSeedHex32(WALLET_SEED_HEX);
    } else {
      const mnemonic = String(WALLET_MNEMONIC || '').trim();
      if (!validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic. Check word count and spelling.');
      }
      // Wallet SDK expects a 32-byte seed. Derive from BIP39 and take first 32 bytes.
      const seedBytes = mnemonicToSeedSync(mnemonic).subarray(0, 32);
      seedHex = Buffer.from(seedBytes).toString('hex');
      console.warn('Using first 32 bytes of BIP39 seed for wallet SDK.');
    }

    const networkId = parseNetworkId(NETWORK_ID)
    const wallet = await WalletBuilder.build(
      String(INDEXER_URI),
      String(INDEXER_WS),
      String(PROVER_SERVER_URI),
      String(NODE_URI),
      seedHex,
      networkId
    )
    wallet.start?.()

    const walletState = await firstValueFrom(wallet.state())

    zkConfigProvider = makeFileZkConfigProvider(ZK_CONFIG_DIR)
    privateStateProvider = new MemoryPrivateStateProvider()
    publicDataProvider = {
      queryContractState: async () => null,
      queryZSwapAndContractState: async () => null,
      queryDeployContractState: async () => null,
      queryUnshieldedBalances: async () => null,
      watchForContractState: async () => {
        throw new Error('Not supported in this script')
      },
      watchForUnshieldedBalances: async () => {
        throw new Error('Not supported in this script')
      },
      watchForDeployTxData: async () => {
        throw new Error('Not supported in this script')
      },
      watchForTxData: async () => {
        throw new Error('Not supported in this script')
      },
      contractStateObservable: () => {
        throw new Error('Not supported in this script')
      },
      unshieldedBalancesObservable: () => {
        throw new Error('Not supported in this script')
      },
    }
    proofProvider = {
      proveTx: async (unprovenTx: any) =>
        wallet.proveTransaction({ type: TRANSACTION_TO_PROVE, transaction: unprovenTx }),
    }
    walletProvider = {
      balanceTx: async (tx: any) => {
        const recipe = await wallet.balanceTransaction(tx, [])
        if (recipe.type === NOTHING_TO_PROVE) return recipe.transaction
        if (recipe.type === BALANCE_TRANSACTION_TO_PROVE || recipe.type === TRANSACTION_TO_PROVE) {
          return wallet.proveTransaction(recipe)
        }
        throw new Error(`Unsupported proving recipe: ${String((recipe as any).type)}`)
      },
      getCoinPublicKey: () => walletState.coinPublicKey,
      getEncryptionPublicKey: () => walletState.encryptionPublicKey,
    }
    midnightProvider = {
      submitTx: async (tx: any) => wallet.submitTransaction(tx),
    }
  }

  // If we reached this point the user provided the essential env vars. Provide
  // a providers object that acts as a placeholder for the real provider instances.
  const providers: any = {
    proofProvider: proofProvider || { url: PROVER_SERVER_URI || 'http://localhost:0' },
    zkConfigProvider: zkConfigProvider || { zkRoot: ZK_CONFIG_DIR },
    publicDataProvider:
      publicDataProvider || { indexerUri: INDEXER_URI || 'http://localhost:0', indexerWs: INDEXER_WS || 'ws://localhost:0' },
    privateStateProvider: privateStateProvider || { path: PRIVATE_STATE_DB_PATH },
    walletProvider: walletProvider || (WALLET_PRIVATE_KEY ? { privateKey: WALLET_PRIVATE_KEY } : null),
    midnightProvider: midnightProvider || { submitTx: async (_tx: any) => { throw new Error('midnightProvider not configured') } },
  }

  if (dryRun) {
    console.log('Dry-run mode enabled — providers validated (placeholders):')
    console.log(JSON.stringify({ proofProvider: providers.proofProvider, publicDataProvider: providers.publicDataProvider, zkConfigProvider: providers.zkConfigProvider }, null, 2))
    process.exit(0)
  }

  // The code below demonstrates calling `deployContract` once you have
  // `providers` object prepared (matching the shapes expected by midnight-js).

  let compiled = CompiledContract.make('lending', LendingContract)
  // Some builds of compact-js don't expose .pipe() at runtime; apply functions directly.
  compiled = CompiledContract.withVacantWitnesses(compiled)
  compiled = CompiledContract.withCompiledFileAssets(zkConfigPath)(compiled)

  try {
    const deployed = await deployContract(providers, {
      compiledContract: compiled,
      privateStateId: 'lendingPrivateState',
      initialPrivateState: { /* example: borrower_secret: new Uint8Array(...) */ },
    });

    console.log('Deployed contract:', deployed.deployTxData.public.contractAddress.toString());
  } catch (err) {
    console.error('Deploy failed:', err);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
