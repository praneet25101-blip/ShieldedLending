import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { Contract as LendingContract } from './managed/lending/contract/index.js';

// Browser-safe Midnight API wrapper for the lending contract
export class MidnightDAppAPI {
  private lendingCompiledContract: any;
  private providers: any;

  constructor() { }

  async initialize(
    walletAPI: any,
    uris?: { indexerUri: string; indexerWsUri: string }
  ) {
    const shielded = walletAPI?.getShieldedAddresses
      ? await walletAPI.getShieldedAddresses()
      : null;
    const walletState = walletAPI?.state ? await walletAPI.state() : null;
    const resolvedUris = uris || (walletAPI?.getConfiguration ? await walletAPI.getConfiguration() : null);
    if (!resolvedUris) {
      throw new Error('Missing wallet service URIs (indexer).');
    }

    const fetchResource = async (path: string) => {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error(`Failed to fetch ZK resource: ${path}`);
      const ab = await resp.arrayBuffer();
      return new Uint8Array(ab);
    };

    const keyMaterialProvider = {
      getZKIR: async (c: string) => fetchResource(`/zkir/${c}.bzkir`),
      getProverKey: async (c: string) => fetchResource(`/keys/${c}.prover`),
      getVerifierKey: async (c: string) => fetchResource(`/keys/${c}.verifier`),
      get: async (c: string) => ({
        circuitId: c,
        proverKey: await fetchResource(`/keys/${c}.prover`),
        verifierKey: await fetchResource(`/keys/${c}.verifier`),
        zkir: await fetchResource(`/zkir/${c}.bzkir`),
      }),
    };

    const proofProvider = walletAPI?.getProvingProvider
      ? await walletAPI.getProvingProvider(keyMaterialProvider)
      : null;
    if (!proofProvider) {
      throw new Error('Wallet does not provide a proving provider.');
    }

    this.providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'p2p-lending-private-state',
      }),
      publicDataProvider: indexerPublicDataProvider(
        resolvedUris.indexerUri,
        resolvedUris.indexerWsUri
      ),
      zkConfigProvider: keyMaterialProvider,
      proofProvider,
      walletProvider: {
        balanceTx: async (tx: any) => {
          if (walletAPI?.balanceUnsealedTransaction) {
            return walletAPI.balanceUnsealedTransaction(tx);
          }
          if (walletAPI?.balanceTx) {
            return walletAPI.balanceTx(tx);
          }
          throw new Error('Wallet does not support transaction balancing.');
        },
        getCoinPublicKey: () => {
          const key =
            shielded?.shieldedCoinPublicKey ||
            walletState?.coinPublicKey ||
            walletState?.state?.coinPublicKey ||
            walletState?.shieldedCoinPublicKey;
          if (!key) {
            throw new Error('Wallet coin public key not available.');
          }
          return key;
        },
        getEncryptionPublicKey: () => {
          const key =
            shielded?.shieldedEncryptionPublicKey ||
            walletState?.encryptionPublicKey ||
            walletState?.state?.encryptionPublicKey ||
            walletState?.shieldedEncryptionPublicKey;
          if (!key) {
            throw new Error('Wallet encryption public key not available.');
          }
          return key;
        },
      },
      midnightProvider: {
        submitTx: async (tx: any) => walletAPI.submitTransaction(tx),
      },
    };

    this.lendingCompiledContract = CompiledContract.make('lending', LendingContract)
      .pipe(CompiledContract.withVacantWitnesses);
  }

  // Deploy + register a borrower's commitment on-chain
  async registerCredit(commitment: Uint8Array, walletAddress: Uint8Array) {
    const lendingContract = await deployContract(this.providers, {
      compiledContract: this.lendingCompiledContract,
      privateStateId: 'lendingPrivateState',
      initialPrivateState: { borrower_secret: commitment },
      args: [commitment, walletAddress]
    });

    const finalizedTx = await lendingContract.callTx.register_credit(commitment, walletAddress);
    return {
      txHash: finalizedTx.public.txHash,
      contractAddress: lendingContract.deployTxData.public.contractAddress
    };
  }

  async createLoanRequest(contractAddress: string, commitment: Uint8Array, amount: bigint, walletAddress: Uint8Array) {
    const lendingContract = await findDeployedContract(this.providers, {
      compiledContract: this.lendingCompiledContract,
      contractAddress,
      privateStateId: 'lendingPrivateState'
    });

    const result = await lendingContract.callTx.create_loan_request(commitment, amount, walletAddress);
    return result.public;
  }

  async proveCreditThreshold(contractAddress: string, secret: Uint8Array, minScore: number, walletAddress: Uint8Array) {
    const lendingContract = await findDeployedContract(this.providers, {
      compiledContract: this.lendingCompiledContract,
      contractAddress,
      privateStateId: 'lendingPrivateState'
    });

    const result = await lendingContract.callTx.prove_credit_threshold(secret, BigInt(minScore), walletAddress);
    return result.public;
  }

  async approveAndDisburseLoan(contractAddress: string, secret: Uint8Array, minScore: number, recipientWallet: Uint8Array, amount: bigint) {
    const lendingContract = await findDeployedContract(this.providers, {
      compiledContract: this.lendingCompiledContract,
      contractAddress,
      privateStateId: 'lendingPrivateState'
    });

    const result = await lendingContract.callTx.approve_and_disburse_loan(
      secret,
      BigInt(minScore),
      recipientWallet,
      BigInt(amount)
    );

    return {
      success: true,
      txHash: result.public.txHash,
      amount,
      recipient: Array.from(recipientWallet).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  }
}
