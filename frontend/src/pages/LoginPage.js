import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Calculator, TrendingUp, Shield, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <img
            src="https://customer-assets.emergentagent.com/job_dual-fin-calc/artifacts/503uepwb_Vittlit%20Logo%20600X300.jpg"
            alt="Vittlit Logo"
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to save and access your financial calculations
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Save calculation history</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Track investment plans</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Secure & private data</span>
          </div>
        </div>

        <Button
          onClick={login}
          className="w-full h-14 text-lg font-black bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-xl"
          data-testid="login-with-google-btn"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign in with Google
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}