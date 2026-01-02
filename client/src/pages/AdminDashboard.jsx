import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Users,
    Trash2,
    LogOut,
    Shield,
    User as UserIcon,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const AdminDashboard = () => {
    const { createUser, getUsers, deleteUser, logout, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Instructor' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUser(newUser.username, newUser.password, newUser.role);
            setMessage({ type: 'success', text: 'User successfully provisioned!' });
            setNewUser({ username: '', password: '', role: 'Instructor' });
            fetchUsers();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error creating user' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                setMessage({ type: 'success', text: 'Entity successfully purged' });
                fetchUsers();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Error deleting user' });
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen p-4 md:p-8 bg-[#0b0f1a] text-slate-200"
        >
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                <motion.div variants={itemVariants} className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-glow animate-pulse">
                        <Shield className="w-9 h-9 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gradient uppercase tracking-tighter">
                            Control Center
                        </h1>
                        <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-1">System Authorization & Node Management</p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-6 glass-card px-8 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <UserIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Authorized Admin</p>
                            <p className="text-white font-bold text-lg leading-tight">{user.username}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <button
                        onClick={logout}
                        className="group flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-all duration-300"
                    >
                        <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-widest">Terminate</span>
                    </button>
                </motion.div>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Create Form */}
                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-10">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <UserPlus className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Provision Node</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">ESTABLISH NEW PERMISSIONS</p>
                            </div>
                        </div>

                        <AnimatePresence mode='wait'>
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`flex items-center gap-3 p-4 rounded-2xl mb-8 border ${message.type === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        }`}
                                >
                                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                    <p className="text-sm font-bold tracking-tight">{message.text}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Identifier</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="premium-input text-lg"
                                    placeholder="e.g. op_standard_01"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Protocol</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="premium-input text-lg"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Tier</label>
                                <div className="relative">
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="premium-input appearance-none bg-[#0b0f1a] text-lg pr-10"
                                    >
                                        <option value="Instructor">Instructor</option>
                                        <option value="Admin">Administrator</option>
                                        <option value="Student">Student</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Shield size={16} />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="premium-button w-full h-16 text-lg flex items-center justify-center gap-3 mt-4"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-6 h-6" />
                                        CONFIRM PROVISION
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-8 border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Shield size={120} />
                        </div>
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-black text-white uppercase tracking-tight">Security Protocol</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mt-2 font-medium">
                                    Provisioned nodes are required to update credentials upon initial access. All operations are logged.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Table Section */}
                <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col">
                    <div className="glass-card flex-1 overflow-hidden flex flex-col">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <Users className="w-7 h-7 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Node Registry</h2>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">ACTIVE DIRECTORY ENTITIES</p>
                                </div>
                            </div>
                            <span className="px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20 tracking-widest">
                                {users.length} REGISTERED NODES
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Entity Profile</th>
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Tier Status</th>
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 text-right">State Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode='popLayout'>
                                        {users.map((u) => (
                                            <motion.tr
                                                key={u._id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20 text-lg">
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-slate-100 text-lg tracking-tight">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${u.role === 'Admin'
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                                        : u.role === 'Instructor'
                                                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    {u.username !== user.username ? (
                                                        <button
                                                            onClick={() => handleDelete(u._id)}
                                                            className="p-3 bg-white/5 hover:bg-rose-500/10 rounded-2xl text-slate-600 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all duration-300 group/del"
                                                            title="Purge Node"
                                                        >
                                                            <Trash2 className="w-5 h-5 transition-transform group-hover/del:scale-110" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mr-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">Current Operator</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        {users.length === 0 && (
                            <div className="py-32 text-center text-slate-600">
                                <Users className="w-20 h-20 mx-auto mb-6 opacity-10 animate-pulse" />
                                <p className="font-bold uppercase tracking-widest text-xs">No Node Records Detected</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;

