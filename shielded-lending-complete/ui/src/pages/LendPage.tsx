import { useState } from 'react';
import { Search, TrendingUp, Clock, Shield, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  duration: number;
  collateral: number;
  creditScore: string; // "Proven: >= 600" - actual score hidden
  createdAt: Date;
  status: 'open' | 'funded';
}

export function LendPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rate' | 'amount' | 'duration'>('rate');
  const [fundingLoanId, setFundingLoanId] = useState<string | null>(null);

  // Mock data - in production, fetch from contract
  const loans: Loan[] = [
    {
      id: '0x1a2b...',
      amount: 10000,
      interestRate: 5,
      duration: 30,
      collateral: 8000,
      creditScore: 'Proven: >= 700',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'open'
    },
    {
      id: '0x3c4d...',
      amount: 5000,
      interestRate: 8,
      duration: 60,
      collateral: 4000,
      creditScore: 'Proven: >= 650',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'open'
    },
    {
      id: '0x5e6f...',
      amount: 25000,
      interestRate: 6,
      duration: 90,
      collateral: 20000,
      creditScore: 'Proven: >= 750',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'open'
    }
  ];

  const handleFundLoan = async (loanId: string) => {
    setFundingLoanId(loanId);
    try {
      // In production: call contract's fundLoanRequest circuit
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Loan funded successfully!');
    } catch (error) {
      console.error('Failed to fund loan:', error);
    } finally {
      setFundingLoanId(null);
    }
  };

  const calculateReturn = (principal: number, rate: number, days: number) => {
    const interest = principal * (rate / 100) * (days / 365);
    return principal + interest;
  };

  const sortedLoans = [...loans].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        return b.interestRate - a.interestRate;
      case 'amount':
        return b.amount - a.amount;
      case 'duration':
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Browse Loan Requests</h1>
        <p className="text-purple-200 text-lg">
          Fund loans and earn interest. All borrowers have verified credit proofs.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Search by Amount or ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search loans..."
                className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition"
            >
              <option value="rate">Highest Interest Rate</option>
              <option value="amount">Highest Amount</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loan Cards */}
      <div className="grid gap-6">
        {sortedLoans.map((loan) => (
          <div
            key={loan.id}
            className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/30 transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Loan Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        {loan.amount.toLocaleString()} tDUST
                      </h3>
                      <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                        OPEN
                      </span>
                    </div>
                    <p className="text-purple-300 text-sm font-mono">{loan.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">{loan.interestRate}%</div>
                    <div className="text-purple-300 text-sm">APR</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-purple-400 text-sm mb-1">Duration</div>
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <Clock className="w-4 h-4" />
                      {loan.duration} days
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-400 text-sm mb-1">Collateral</div>
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <Shield className="w-4 h-4" />
                      {loan.collateral.toLocaleString()} tDUST
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-400 text-sm mb-1">Credit Proof</div>
                    <div className="flex items-center gap-1 text-green-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {loan.creditScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-400 text-sm mb-1">Expected Return</div>
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      {calculateReturn(loan.amount, loan.interestRate, loan.duration).toLocaleString()} tDUST
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-purple-300 text-sm">
                  <Clock className="w-4 h-4" />
                  Created {formatDistanceToNow(loan.createdAt, { addSuffix: true })}
                </div>
              </div>

              {/* Action */}
              <div className="lg:w-48 flex flex-col gap-3">
                <div className="bg-purple-900/50 rounded-lg p-4 text-center">
                  <div className="text-purple-300 text-sm mb-1">You'll Receive</div>
                  <div className="text-white font-bold text-xl">
                    {calculateReturn(loan.amount, loan.interestRate, loan.duration).toLocaleString()}
                  </div>
                  <div className="text-purple-400 text-xs">
                    +{((calculateReturn(loan.amount, loan.interestRate, loan.duration) - loan.amount)).toFixed(0)} tDUST profit
                  </div>
                </div>
                <button
                  onClick={() => handleFundLoan(loan.id)}
                  disabled={fundingLoanId === loan.id}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-purple-500/20"
                >
                  {fundingLoanId === loan.id ? 'Funding...' : 'Fund Loan'}
                </button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <Shield className="w-4 h-4" />
                <span>
                  Borrower identity is protected. You're funding based on verified credit proof only.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedLoans.length === 0 && (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No loans available</h3>
          <p className="text-purple-300">Check back later for new loan requests</p>
        </div>
      )}
    </div>
  );
}
