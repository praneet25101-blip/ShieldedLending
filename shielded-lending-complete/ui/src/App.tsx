import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { BorrowPage } from './pages/BorrowPage';
import { LendPage } from './pages/LendPage';
import { MyLoansPage } from './pages/MyLoansPage';
import { CreditProofPage } from './pages/CreditProofPage';
import { useWalletStore } from './store/walletStore';

function App() {
  const { connected } = useWalletStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/borrow" 
              element={connected ? <BorrowPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/lend" 
              element={connected ? <LendPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/my-loans" 
              element={connected ? <MyLoansPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/credit-proof" 
              element={connected ? <CreditProofPage /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        {/* Privacy Notice Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-purple-900/30 backdrop-blur-sm border-t border-purple-500/20 py-3">
          <div className="container mx-auto px-4 text-center text-sm text-purple-200">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Your identity and credit score are protected by zero-knowledge proofs
            </span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
