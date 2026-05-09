import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Github } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/auth/InputField';
import { PasswordInput } from '../components/auth/PasswordInput';
import { useAuth } from '../context/AuthContext';
import AuthSplitLayout from '../layouts/AuthSplitLayout';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Authenticated successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="text-slate-400 mt-2 font-medium">Log in to your dashboard to manage your devices.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Email or Username"
          icon={Mail}
          type="text"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-800 bg-slate-900 group-hover:border-slate-700'}`}>
                {rememberMe && <div className="h-2 w-2 bg-white rounded-full" />}
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
            </div>
            <a href="#" className="text-xs text-blue-500 hover:text-blue-400 font-semibold transition-colors tracking-tight">Forgot password?</a>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20" 
          isLoading={isLoading}
        >
          Sign In <ArrowRight className="ml-2" size={16} />
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#020617] px-2 text-slate-500 font-bold tracking-widest">Or continue with</span></div>
        </div>

        <Button variant="secondary" className="w-full h-11 rounded-xl">
           <Github size={18} className="mr-2" /> GitHub
        </Button>
      </form>

      <p className="mt-8 text-center text-slate-400 text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-white font-bold hover:text-blue-500 transition-colors">
          Create an account
        </Link>
      </p>
    </AuthSplitLayout>
  );
};

export default LoginPage;
