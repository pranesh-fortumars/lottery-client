import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageWrapper, { SupportSection } from '../components/PageWrapper';
import { LogIn, Lock, UserPlus, HelpCircle, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      // Navigate to / so LandingPage logic can direct based on role
      navigate('/'); 
    } else {
      setError(result.message);
    }
  };

  return (
    <PageWrapper title="LOGIN ACCESS" showNav={false}>
      <div className="bg-slate-50 min-h-screen p-6 flex flex-col items-center">
        {error && (
          <div className="w-full bg-red-50 text-red-600 p-4 rounded-2xl mb-4 flex items-center gap-3 text-xs font-bold border border-red-100">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <form className="w-full space-y-5 pt-10 max-w-md mx-auto" onSubmit={handleLogin}>
          {/* ID Input Group */}
          <div className="flex border border-slate-400 rounded-2xl overflow-hidden h-14 bg-white shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-ring transition-all">
            <div className="bg-slate-50 px-5 flex items-center justify-center border-r border-slate-900 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              ID
            </div>
            <input 
              className="flex-grow px-4 outline-none border-none focus:ring-0 text-sm font-bold text-black bg-transparent placeholder:text-slate-300" 
              placeholder="Username, Mobile Number, or Email" 
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* Password Input Group */}
          <div className="flex border border-slate-400 rounded-2xl overflow-hidden h-14 bg-white shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-ring transition-all">
            <div className="bg-slate-50 px-5 flex items-center justify-center border-r border-slate-900">
               <Lock size={16} className="text-slate-400" />
            </div>
            <input 
              className="flex-grow px-4 outline-none border-none focus:ring-0 text-sm font-bold text-black bg-transparent placeholder:text-slate-300" 
              placeholder="Enter your password" 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-6 space-y-4">
            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
              type="submit"
            >
               {loading ? "Verifying..." : "Confirm Identity"} <LogIn size={16} />
            </button>
            
            <div className="flex gap-4">
              <button 
                className="flex-1 bg-white border border-slate-400 text-slate-600 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-primary hover:text-primary transition-all shadow-sm" 
                type="button"
                onClick={() => navigate('/signup')}
              >
                New Account
              </button>
              <button 
                className="flex-[2] bg-white border border-slate-400 text-slate-600 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-primary hover:text-primary transition-all shadow-sm" 
                type="button"
                onClick={() => navigate('/reset-password')}
              >
                Reset Password
              </button>
            </div>
          </div>
        </form>

        <SupportSection />
      </div>
    </PageWrapper>
  );
};

export default LoginPage;
