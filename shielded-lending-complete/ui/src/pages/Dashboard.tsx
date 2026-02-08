import { ArrowRight, Shield, Lock, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';

export function Dashboard() {
  const { connected } = useWalletStore();

  const stats = [
    { label: 'Total Loans Issued', value: '1,247', icon: TrendingUp },
    { label: 'Total Volume', value: '₮ 4.2M', icon: Users },
    { label: 'Active Borrowers', value: '543', icon: Shield },
    { label: 'Average APR', value: '8.5%', icon: Lock }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">
            Powered by Zero-Knowledge Proofs on Midnight Network
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Borrow & Lend
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Without Revealing
          </span>
          <br />
          Your Identity
        </h1>
        
        <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-10">
          Privacy-preserving P2P lending where borrowers keep their credit scores private 
          and lenders receive cryptographic proof of creditworthiness
        </p>

        {!connected ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-purple-500/30 transition">
              Get Started
            </button>
            <a 
              href="https://docs.midnight.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              Learn More
            </a>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/borrow" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-purple-500/30 transition flex items-center justify-center gap-2"
            >
              Request a Loan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/lend" 
              className="bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              Browse Loans
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/30 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8 text-purple-400" />
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-purple-300" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-purple-300">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Zero-Knowledge Privacy</h3>
          <p className="text-purple-200 leading-relaxed">
            Your credit score and identity are never revealed on-chain. 
            Lenders receive cryptographic proof of creditworthiness without seeing your actual score.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Collateral Protected</h3>
          <p className="text-purple-200 leading-relaxed">
            Smart contracts automatically manage collateral. 
            Repay on time to get your collateral back, or it's transferred to the lender on default.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">P2P Marketplace</h3>
          <p className="text-purple-200 leading-relaxed">
            Direct lending between users. 
            Set your own terms as a borrower, or choose loans that match your risk appetite as a lender.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-purple-900/10 border border-purple-500/10 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Get Credit Proof</h3>
            <p className="text-purple-200">
              A trusted verifier creates a zero-knowledge proof of your creditworthiness 
              without revealing your actual score
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Request or Fund Loans</h3>
            <p className="text-purple-200">
              Borrowers create loan requests with collateral. 
              Lenders browse and fund loans based on ZK proofs
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Repay & Earn</h3>
            <p className="text-purple-200">
              Borrowers repay to retrieve collateral and build reputation. 
              Lenders earn interest on successful loans
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
