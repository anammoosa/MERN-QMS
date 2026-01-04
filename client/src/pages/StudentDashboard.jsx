import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuiz } from '../hooks/useQuiz';
import QuizTaker from '../components/QuizTaker';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  LogOut,
  Play,
  Clock,
  Sparkles,
  FileText,
  ChevronLeft,
  Calendar,
  Trophy,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { logout, user } = useAuth();
  const { quizzes, getQuizzes, loading } = useQuiz();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch history directly here or via hook - keeping it simple
  useEffect(() => {
    import('../services/api').then(({ reportingService, quizService }) => {
      if (user?.id) {
        reportingService.getStudentHistory(user.id).then(async (res) => {
          // Enrich with quiz titles if needed (or backend should populate)
          // For now, let's assume we might need to match with 'quizzes' or fetch
          const subs = res.data;
          const enriched = await Promise.all(subs.map(async s => {
            if (!s.quizTitle) {
              try {
                const q = await quizService.getQuiz(s.quizId);
                return { ...s, quizTitle: q.data.title };
              } catch (e) { return { ...s, quizTitle: 'Unknown Assessment' }; }
            }
            return s;
          }));
          setHistory(enriched);
        }).catch(err => console.error(err));
      }
    });
  }, [user]);

  useEffect(() => {
    getQuizzes(null); // Fetch all published quizzes
  }, [getQuizzes, selectedQuiz]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  if (selectedQuiz) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-screen bg-[#0b0f1a] text-slate-200"
      >
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <button
            onClick={() => setSelectedQuiz(null)}
            className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 font-black text-xs tracking-widest mb-10 transition-colors group"
          >
            <ChevronLeft className="group-hover:-translate-x-1 transition-transform w-5 h-5" />
            RETURN TO PORTAL
          </button>

          <div className="glass-card p-1">
            <QuizTaker quiz={selectedQuiz} onFinish={() => {
              setSelectedQuiz(null);
              toast.success('Assessment completed!');
            }} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 md:p-8 bg-[#0b0f1a] text-slate-200 relative"
    >
      {loading && (
        <div className="absolute inset-0 bg-[#0b0f1a]/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-glow animate-pulse">
            <GraduationCap className="w-9 h-9 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gradient uppercase tracking-tighter">
              Student Portal
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-1">Unified Assessment Center</p>
          </div>
        </div>

        <div className="flex items-center gap-6 glass-card px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Success Track</p>
              <p className="text-white font-bold text-lg leading-tight">{user.username}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <button onClick={logout} className="group flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-all duration-300">
            <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Terminate</span>
          </button>
        </div>
      </header>

      {/* Welcome Banner */}
      <motion.div variants={cardVariants} className="glass-card p-10 mb-12 bg-gradient-to-r from-indigo-600/10 to-transparent flex flex-col md:flex-row items-center gap-10 border-indigo-500/20 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Trophy size={200} />
        </div>
        <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-premium shrink-0 relative z-10">
          <Trophy className="text-white w-12 h-12" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Achieve Excellence</h2>
          <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">
            Welcome to your synchronized evaluation node. Access established assessments curated by authorized instructors.
            Review technical documentation before initiating timed protocols.
          </p>
        </div>
      </motion.div>

      {/* Recent History Section */}
      {history.length > 0 && (
        <div className="mb-12">
          <h3 className="flex items-center gap-3 text-lg font-black text-slate-400 uppercase tracking-widest mb-6 px-2">
            <History className="text-indigo-400" /> Recent Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((att) => (
              <div key={att._id} className="glass-card p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
                <div>
                  <p className="text-white font-bold text-lg">{att.quizTitle || 'Assessment'}</p>
                  <p className="text-slate-500 text-xs font-mono mt-1">
                    {new Date(att.submittedAt).toLocaleDateString()} • Score: <span className="text-emerald-400 font-bold">{att.score}</span>
                  </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest">
                  {att.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.length === 0 ? (
          <div className="col-span-full py-32 text-center glass-card bg-white/[0.02]">
            <Calendar className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
            <h3 className="text-xl font-bold text-slate-500 mb-2 uppercase tracking-widest">No Active Sessions</h3>
            <p className="text-slate-600">Stand by for upcoming assessment modules.</p>
          </div>
        ) : (
          quizzes.map(q => (
            <motion.div
              key={q._id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="glass-card p-10 flex flex-col hover:bg-white/[0.04] transition-all duration-500 group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <Sparkles size={80} className="text-white" />
              </div>

              <h3 className="text-xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-tight">{q.title}</h3>
              <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium italic border-l-2 border-indigo-500/30 pl-4">
                {q.description || 'Global assessment module with standardized evaluation criteria.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <FileText size={16} className="text-indigo-400" />
                  </div>
                  <span>{q.questions.length} Units</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Clock size={16} className="text-indigo-400" />
                  </div>
                  <span>{q.duration ? `${q.duration} MIN` : '∞'}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedQuiz(q)}
                className="premium-button w-full mt-auto h-14 flex items-center justify-center gap-3 group/btn"
              >
                <Play size={20} fill="currentColor" className="transition-transform group-hover/btn:scale-110" />
                INITIATE ATTEMPT
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default StudentDashboard;

