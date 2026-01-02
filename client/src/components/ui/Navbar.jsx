import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Bell, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-8 py-4 !rounded-3xl border-white/5 shadow-2xl">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center not-italic text-sm shadow-lg shadow-indigo-500/20">Q</div>
            QMS<span className="text-indigo-500">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="#" className="text-sm font-bold text-white uppercase tracking-widest hover:text-indigo-400 transition-colors">Courses</Link>
            <Link to="#" className="text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Assessments</Link>
            <Link to="#" className="text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Resources</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-slate-500 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <button className="text-slate-500 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0f172a]" />
          </button>

          <div className="h-8 w-px bg-white/5 mx-2" />

          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white uppercase tracking-tighter leading-none">{username}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">{role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-lg bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
