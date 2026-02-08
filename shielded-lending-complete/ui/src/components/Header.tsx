import { Link } from 'react-router-dom';
import { Shield, Wallet, LogOut } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';

export function Header() {
  const { connected, address, balance, connecting, connect, disconnect } = useWalletStore();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-purple-900/20 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:text-purple-300 transition">
            <Shield className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold">ShieldedLending</h1>
              <p className="text-xs text-purple-300">Privacy-First P2P Lending</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/borrow" 
              className="text-purple-200 hover:text-white transition font-medium"
            >
              Borrow
            </Link>
            <Link 
              to="/lend" 
              className="text-purple-200 hover:text-white transition font-medium"
            >
              Lend
            </Link>
            <Link 
              to="/my-loans" 
              className="text-purple-200 hover:text-white transition font-medium"
            >
              My Loans
            </Link>
            <Link 
              to="/credit-proof" 
              className="text-purple-200 hover:text-white transition font-medium"
            >
              Credit Proof
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {connected ? (
              <>
                <div className="hidden sm:flex flex-col items-end text-sm">
                  <span className="text-purple-300">Balance</span>
                  <span className="text-white font-semibold">{balance} tDUST</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-lg border border-purple-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white font-mono text-sm">
                    {address && formatAddress(address)}
                  </span>
                  <button
                    onClick={disconnect}
                    className="ml-2 p-1 hover:bg-purple-700/50 rounded transition"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-purple-500/20"
              >
                <Wallet className="w-5 h-5" />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-4 mt-4 pb-2 overflow-x-auto">
          <Link 
            to="/borrow" 
            className="text-purple-200 hover:text-white transition font-medium whitespace-nowrap"
          >
            Borrow
          </Link>
          <Link 
            to="/lend" 
            className="text-purple-200 hover:text-white transition font-medium whitespace-nowrap"
          >
            Lend
          </Link>
          <Link 
            to="/my-loans" 
            className="text-purple-200 hover:text-white transition font-medium whitespace-nowrap"
          >
            My Loans
          </Link>
          <Link 
            to="/credit-proof" 
            className="text-purple-200 hover:text-white transition font-medium whitespace-nowrap"
          >
            Credit Proof
          </Link>
        </nav>
      </div>
    </header>
  );
}
