import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuiz } from '../hooks/useQuiz';
import QuizEditor from '../components/QuizEditor';
import BatchUpload from '../components/BatchUpload';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PlusCircle,
    UploadCloud,
    Users,
    LogOut,
    BookOpen,
    Trash2,
    BarChart3,
    UserPlus,
    Clock,
    CheckCircle2,
    BookOpenCheck,
    Briefcase,
    Edit,
    Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8002/api';

const TeacherDashboard = () => {
    const { logout, user } = useAuth();
    const { quizzes, getQuizzes } = useQuiz();
    const [view, setView] = useState('list'); // list, create, upload, students
    const [isLoading, setIsLoading] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);

    useEffect(() => {
        if (user) {
            getQuizzes(user.id);
        }
    }, [user, getQuizzes, view]);

    const handleCreateQuiz = async (quizData) => {
        setIsLoading(true);
        try {
            if (editingQuiz) {
                // Update existing quiz
                await axios.put(`${API_GATEWAY_URL}/quizzes/${editingQuiz._id}`, quizData, { withCredentials: true });
                toast.success('Quiz updated successfully!');
            } else {
                // Create new quiz
                await axios.post(`${API_GATEWAY_URL}/quizzes/create`, quizData, { withCredentials: true });
                toast.success('Quiz published successfully!');
            }
            setView('list');
            setEditingQuiz(null); // Reset editing state
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save quiz');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (quiz) => {
        setEditingQuiz(quiz);
        setView('create');
    };

    const togglePublish = async (quiz) => {
        // Optimistic UI Update
        const updatedQuizzes = quizzes.map(q => q._id === quiz._id ? { ...q, isPublished: !q.isPublished } : q);
        // We need to access setQuizzes here, but it's inside useQuiz. 
        // Ideally useQuiz should provide specific mutators, but let's just trigger re-fetch.
        // Actually, to make it instant, we need local state or cache invalidation.
        try {
            await axios.put(`${API_GATEWAY_URL}/quizzes/${quiz._id}`, { ...quiz, isPublished: !quiz.isPublished }, { withCredentials: true });
            toast.success(quiz.isPublished ? 'Quiz unpublished (Draft)' : 'Quiz published to Student Portal');
            getQuizzes(user.id);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API_GATEWAY_URL}/quizzes/${deleteId}`, { withCredentials: true });
            toast.success('Assessment deleted successfully');
            getQuizzes(user.id);
        } catch (error) {
            toast.error('Failed to delete assessment');
        } finally {
            setDeleteId(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading && view === 'list' && quizzes.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen p-4 md:p-8 bg-[#0b0f1a] text-slate-200"
        >
            {/* Header Area */}
            <motion.header variants={cardVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-glow animate-pulse">
                        <Briefcase className="w-9 h-9 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gradient uppercase tracking-tighter">
                            Instructor Hub
                        </h1>
                        <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-1">Assessment Architecture & Intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 glass-card px-8 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                            <span className="text-emerald-400 text-xl font-black">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Authorized Operator</p>
                            <p className="text-white font-bold text-lg leading-tight">{user.username}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <button onClick={logout} className="group flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-all duration-300">
                        <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-widest">Terminate</span>
                    </button>
                </div>
            </motion.header>

            {/* View Switcher / Quick Actions */}
            <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                    { id: 'list', icon: BookOpen, label: 'Repository', sub: 'Manage Quizzes' },
                    { id: 'create', icon: PlusCircle, label: 'Architect', sub: 'New Assessment' },
                    { id: 'upload', icon: UploadCloud, label: 'Ingestion', sub: 'Batch Import' },
                    { id: 'students', icon: Users, label: 'Enrollment', sub: 'User Access' },
                ].map((action) => (
                    <button
                        key={action.id}
                        onClick={() => {
                            if (action.id === 'create') setEditingQuiz(null); // Reset edit state when manually clicking 'Architect'
                            setView(action.id);
                        }}
                        className={`flex flex-col items-start gap-4 p-8 glass-card transition-all duration-500 group relative overflow-hidden ${view === action.id
                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-premium scale-[1.02]'
                            : 'hover:bg-white/[0.03] border-white/5 grayscale hover:grayscale-0'
                            }`}
                    >
                        <div className={`p-3 rounded-2xl transition-colors ${view === action.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                            <action.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <span className={`block text-lg font-black tracking-tight ${view === action.id ? 'text-white' : 'text-slate-400'}`}>{action.label}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{action.sub}</span>
                        </div>
                        {view === action.id && (
                            <motion.div layoutId="active-pill" className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                        )}
                    </button>
                ))}
            </motion.div>

            {/* Dynamic Content Rendering */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {view === 'create' && (
                        <div className="glass-card p-10">
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                                    <PlusCircle className="text-indigo-400 w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{editingQuiz ? 'Edit Assessment' : 'Assessment Architect'}</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{editingQuiz ? 'MODIFY EXISTING MODULE' : 'CRAFT HIGH-FIDELITY EVALUATIONS'}</p>
                                </div>
                            </div>
                            <QuizEditor instructorId={user.id} onSave={handleCreateQuiz} isLoading={isLoading} initialData={editingQuiz} />
                        </div>
                    )}

                    {view === 'upload' && (
                        <div className="max-w-4xl mx-auto">
                            <BatchUpload onUploadComplete={() => { setView('list'); toast.success('Batch import complete!'); }} />
                        </div>
                    )}

                    {view === 'students' && <StudentManager />}

                    {view === 'list' && (
                        <div className="glass-card flex flex-col min-h-[500px]">
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                                        <BookOpen className="text-purple-400 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Digital Repository</h2>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">SECURE ASSESSMENT ASSETS</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-5 py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-[0.2em]">
                                        {quizzes.length} OPERATIONAL UNITS
                                    </span>
                                </div>
                            </div>

                            <div className="p-10">
                                {quizzes.length === 0 ? (
                                    <div className="py-32 text-center">
                                        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                                            <BookOpenCheck className="w-12 h-12 text-slate-700 opacity-50" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-400 mb-2">No Records Detected</h3>
                                        <p className="text-slate-600 font-medium mb-8">Launch the architect to establish your first assessment module.</p>
                                        <button onClick={() => setView('create')} className="premium-button">Initialize Unit</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                                        {quizzes.map((q) => (
                                            <motion.div
                                                variants={cardVariants}
                                                key={q._id}
                                                whileHover={{ y: -5 }}
                                                className="group p-8 glass-card border-white/5 hover:border-indigo-500/40 relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${q.isPublished ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {q.isPublished ? 'Operational' : 'Draft'}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-black text-white mb-6 pr-12 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{q.title}</h3>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Complexity</span>
                                                        <div className="flex items-center gap-2 text-indigo-400 font-bold">
                                                            <LayoutDashboard size={14} />
                                                            <span>{q.questions.length} MODS</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Window</span>
                                                        <div className="flex items-center gap-2 text-indigo-400 font-bold">
                                                            <Clock size={14} />
                                                            <span>{q.duration ? `${q.duration} MIN` : '∞'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                                    <button className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-all uppercase tracking-widest group/btn">
                                                        <BarChart3 size={18} className="transition-transform group-hover/btn:scale-110" />
                                                        Analytics
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => togglePublish(q)}
                                                            className={`p-3 rounded-xl transition-all ${q.isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
                                                            title={q.isPublished ? "Unpublish" : "Publish to Student Portal"}
                                                        >
                                                            <Globe size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(q)}
                                                            className="p-3 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                                                            title="Edit Quiz"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(q._id)}
                                                            className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                                            title="Delete Quiz"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0f1423] border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500" />

                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 mx-auto border border-rose-500/20">
                                <Trash2 className="w-8 h-8 text-rose-500" />
                            </div>

                            <h3 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tight">Delete Assessment?</h3>
                            <p className="text-slate-400 text-center text-sm font-medium mb-8 leading-relaxed">
                                This action is permanent and cannot be undone. All student results associated with this module will be expunged.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="px-4 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-colors uppercase tracking-wider text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/25 transition-all uppercase tracking-wider text-xs"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const StudentManager = () => {
    const { createUser } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createUser(formData.username, formData.password, 'Student');
            toast.success('Student provisioned successfully!');
            setFormData({ username: '', password: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Provisioning failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto glass-card p-0 overflow-hidden"
        >
            <div className="p-10 bg-white/[0.02] border-b border-white/5 flex items-center gap-5">
                <div className="p-4 bg-purple-500/10 rounded-3xl border border-purple-500/20">
                    <UserPlus className="text-purple-400 w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Provision Client</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enroll New Student Entity</p>
                </div>
            </div>
            <div className="p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Entity Identifier</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="premium-input text-lg"
                            placeholder="e.g. s_smith_2024"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Access Token</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="premium-input text-lg"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="premium-button w-full h-16 text-lg flex items-center justify-center gap-3 mt-4"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 size={24} />
                                CONFIRM PROVISIONING
                            </>
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default TeacherDashboard;

