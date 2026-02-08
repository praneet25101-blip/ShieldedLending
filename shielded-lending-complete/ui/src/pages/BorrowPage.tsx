import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

export function BorrowPage() {
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('5');
  const [duration, setDuration] = useState('30');
  const [collateral, setCollateral] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const minCollateral = amount ? (parseFloat(amount) * 0.8).toFixed(2) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In production: call the contract's createLoanRequest circuit
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      setSuccess(true);
      setTimeout(() => {
        setAmount('');
        setInterestRate('5');
        setDuration('30');
        setCollateral('');
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to create loan request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Request a Loan</h1>
        <p className="text-purple-200 text-lg">
          Your identity and credit score remain private throughout the process
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-2">Privacy Protection Active</h3>
            <ul className="text-purple-200 space-y-1 text-sm">
              <li>• Your identity is hidden behind a cryptographic commitment</li>
              <li>• Your actual credit score is never revealed to lenders</li>
              <li>• Lenders only see proof that your score meets their requirements</li>
              <li>• All loan activity is privacy-preserving using zero-knowledge proofs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loan Request Form */}
      <form onSubmit={handleSubmit} className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Loan Details</h2>

        <div className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-purple-200 font-medium mb-2">
              Loan Amount (tDUST)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              min="1"
              required
              className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-purple-200 font-medium mb-2">
              Interest Rate (% APR)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                min="1"
                max="50"
                className="flex-1"
              />
              <span className="text-white font-semibold text-lg w-16 text-right">
                {interestRate}%
              </span>
            </div>
            <p className="text-purple-300 text-sm mt-2">
              Lower rates attract more lenders but require better credit proof
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-purple-200 font-medium mb-2">
              Loan Duration (days)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">365 days</option>
            </select>
          </div>

          {/* Collateral */}
          <div>
            <label className="block text-purple-200 font-medium mb-2">
              Collateral Amount (tDUST)
            </label>
            <input
              type="number"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              placeholder={minCollateral}
              min={minCollateral}
              step="0.01"
              required
              className="w-full bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 transition"
            />
            <p className="text-purple-300 text-sm mt-2">
              Minimum required: {minCollateral} tDUST (80% of loan amount)
            </p>
          </div>

          {/* Loan Summary */}
          {amount && (
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6 space-y-3">
              <h3 className="text-white font-semibold mb-4">Loan Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">Principal:</span>
                <span className="text-white font-medium">{amount} tDUST</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">Interest ({interestRate}% for {duration} days):</span>
                <span className="text-white font-medium">
                  {(parseFloat(amount) * parseFloat(interestRate) / 100 * parseFloat(duration) / 365).toFixed(2)} tDUST
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">Platform Fee (1%):</span>
                <span className="text-white font-medium">
                  {(parseFloat(amount) * 0.01).toFixed(2)} tDUST
                </span>
              </div>
              <div className="border-t border-purple-500/30 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total Repayment:</span>
                  <span className="text-purple-400 text-lg">
                    {(
                      parseFloat(amount) + 
                      (parseFloat(amount) * parseFloat(interestRate) / 100 * parseFloat(duration) / 365)
                    ).toFixed(2)} tDUST
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-yellow-200 text-sm">
              <strong>Important:</strong> Make sure you have a valid credit proof before creating a loan request. 
              Visit the Credit Proof page if you haven't submitted one yet.
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-green-200 text-sm">
                <strong>Success!</strong> Your loan request has been created and is now visible to lenders.
                Your identity remains completely private.
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !amount || !collateral}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition shadow-lg shadow-purple-500/20"
          >
            {submitting ? 'Creating Loan Request...' : 'Create Loan Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
