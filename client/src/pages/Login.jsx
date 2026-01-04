import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth(); // Use Hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(username, password); // Use Hook
      toast.success('Successfully logged in!');

      // Redirect based on role
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Instructor') navigate('/teacher');
      else navigate('/student');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0f172a]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />

      <Card className="w-full max-w-[440px] relative z-10 backdrop-blur-2xl bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            <LogIn className="text-white" size={32} />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Secure access to your learning portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            className="w-full py-4 text-lg flex items-center justify-center gap-2 group"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : (
              <>
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs italic">
            Access protected. Contact administrator for enrollment.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <ShieldCheck size={12} />
          Enterprise Grade Security
        </div>
      </Card>
    </div>
  );
};

export default Login;
