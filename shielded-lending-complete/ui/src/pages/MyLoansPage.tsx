import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Clock, TrendingUp, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  duration: number;
  collateral: number;
  startDate: Date;
  endDate: Date;
  repaidAmount: number;
  status: 'active' | 'repaid' | 'defaulted';
  type: 'borrowed' | 'lent';
}

export function MyLoansPage() {
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [claimingLoanId, setClaimingLoanId] = useState<string | null>(null);

  // Mock data - in production, fetch from contract
  const myLoans: Loan[] = [
    {
      id: '0x1a2b...',
      amount: 10000,
      interestRate: 5,
      duration: 30,
      collateral: 8000,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      repaidAmount: 0,
      status: 'active',
      type: 'borrowed'
    },
    {
      id: '0x3c4d...',
      amount: 5000,
      interestRate: 8,
      duration: 60,
      collateral: 4000,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      repaidAmount: 0,
      status: 'active',
      type: 'lent'
    },
    {
      id: '0x5e6f...',
      amount: 15000,
      interestRate: 6,
      duration: 90,
      collateral: 12000,
      startDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      repaidAmount: 15900,
      status: 'repaid',
      type: 'borrowed'
    }
  ];

  const borrowedLoans = myLoans.filter(l => l.type === 'borrowed');
  const lentLoans = myLoans.filter(l => l.type === 'lent');

  const calculateTotalOwed = (loan: Loan) => {
    const interest = loan.amount * (loan.interestRate / 100) * (loan.duration / 365);
    return loan.amount + interest;
  };

  const handleRepayLoan = async (loanId: string) => {
    setRepayingLoanId(loanId);
    try {
      // In production: call contract's repayLoan circuit
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Loan repaid successfully! Your collateral has been returned.');
    } catch (error) {
      console.error('Failed to repay loan:', error);
    } finally {
      setRepayingLoanId(null);
    }
  };

  const handleClaimDefault = async (loanId: string) => {
    setClaimingLoanId(loanId);
    try {
      // In production: call contract's claimDefault circuit
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Collateral claimed successfully!');
    } catch (error) {
      console.error('Failed to claim collateral:', error);
    } finally {
      setClaimingLoanId(null);
    }
  };

  const LoanCard = ({ loan }: { loan: Loan }) => {
    const totalOwed = calculateTotalOwed(loan);
    const daysRemaining = Math.ceil((loan.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;

    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">
                {loan.amount.toLocaleString()} tDUST
              </h3>
              {loan.status === 'active' && (
                <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2 py-1 rounded">
                  ACTIVE
                </span>
              )}
              {loan.status === 'repaid' && (
                <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                  REPAID
                </span>
              )}
              {loan.status === 'defaulted' && (
                <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded">
                  DEFAULTED
                </span>
              )}
            </div>
            <p className="text-purple-300 text-sm font-mono">{loan.id}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{loan.interestRate}%</div>
            <div className="text-purple-300 text-xs">APR</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-purple-400 text-sm mb-1">Duration</div>
            <div className="text-white font-semibold">{loan.duration} days</div>
          </div>
          <div>
            <div className="text-purple-400 text-sm mb-1">Collateral</div>
            <div className="text-white font-semibold">{loan.collateral.toLocaleString()} tDUST</div>
          </div>
          <div>
            <div className="text-purple-400 text-sm mb-1">Started</div>
            <div className="text-white text-sm">
              {formatDistanceToNow(loan.startDate, { addSuffix: true })}
            </div>
          </div>
          <div>
            <div className="text-purple-400 text-sm mb-1">
              {isOverdue ? 'Overdue' : 'Due'}
            </div>
            <div className={`text-sm font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
              {isOverdue ? 
                `${Math.abs(daysRemaining)} days ago` : 
                `in ${daysRemaining} days`
              }
            </div>
          </div>
        </div>

        {loan.status === 'active' && loan.type === 'borrowed' && (
          <>
            <div className="bg-purple-900/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 text-sm">Principal</span>
                <span className="text-white font-medium">{loan.amount.toLocaleString()} tDUST</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 text-sm">Interest</span>
                <span className="text-white font-medium">
                  {(totalOwed - loan.amount).toFixed(2)} tDUST
                </span>
              </div>
              <div className="border-t border-purple-500/30 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Owed</span>
                  <span className="text-purple-400 font-bold text-lg">
                    {totalOwed.toLocaleString()} tDUST
                  </span>
                </div>
              </div>
            </div>

            {isOverdue && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-200 text-sm">
                  <strong>Loan Overdue!</strong> Repay now to avoid collateral loss.
                </div>
              </div>
            )}

            <button
              onClick={() => handleRepayLoan(loan.id)}
              disabled={repayingLoanId === loan.id}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
            >
              {repayingLoanId === loan.id ? 'Repaying...' : 'Repay Loan'}
            </button>
          </>
        )}

        {loan.status === 'active' && loan.type === 'lent' && (
          <div className="space-y-3">
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 text-sm">Expected Return</span>
                <span className="text-purple-400 font-bold text-lg">
                  {totalOwed.toLocaleString()} tDUST
                </span>
              </div>
            </div>

            {isOverdue && (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-yellow-200 text-sm">
                    Borrower has defaulted. You can claim the collateral now.
                  </div>
                </div>
                <button
                  onClick={() => handleClaimDefault(loan.id)}
                  disabled={claimingLoanId === loan.id}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
                >
                  {claimingLoanId === loan.id ? 'Claiming...' : 'Claim Collateral'}
                </button>
              </>
            )}
          </div>
        )}

        {loan.status === 'repaid' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-green-400 font-semibold">Loan Repaid</div>
              <div className="text-green-200 text-sm">
                {loan.type === 'borrowed' ? 
                  'Collateral returned to your wallet' : 
                  `Received ${totalOwed.toLocaleString()} tDUST`
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">My Loans</h1>
        <p className="text-purple-200 text-lg">
          Track your borrowed and lent loans
        </p>
      </div>

      <Tabs defaultValue="borrowed" className="w-full">
        <TabsList>
          <TabsTrigger value="borrowed">
            Borrowed ({borrowedLoans.length})
          </TabsTrigger>
          <TabsTrigger value="lent">
            Lent ({lentLoans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed" className="space-y-4 mt-6">
          {borrowedLoans.length > 0 ? (
            borrowedLoans.map(loan => <LoanCard key={loan.id} loan={loan} />)
          ) : (
            <div className="text-center py-16 bg-purple-900/20 border border-purple-500/20 rounded-xl">
              <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No borrowed loans</h3>
              <p className="text-purple-300 mb-4">You haven't borrowed any loans yet</p>
              <a 
                href="/borrow"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Request a Loan
              </a>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lent" className="space-y-4 mt-6">
          {lentLoans.length > 0 ? (
            lentLoans.map(loan => <LoanCard key={loan.id} loan={loan} />)
          ) : (
            <div className="text-center py-16 bg-purple-900/20 border border-purple-500/20 rounded-xl">
              <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No lent loans</h3>
              <p className="text-purple-300 mb-4">You haven't funded any loans yet</p>
              <a 
                href="/lend"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Browse Loans
              </a>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
