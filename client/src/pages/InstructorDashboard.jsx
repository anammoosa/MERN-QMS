import React, { useState, useEffect } from 'react';
import { quizService, reportingService } from '../services/api';
import { Plus, List, BarChart2, BookOpen, Clock, Users, ChevronRight, X, LayoutGrid, Trash2, FileText, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Navbar from '../components/ui/Navbar';

const InstructorDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [stats, setStats] = useState({ totalQuizzes: 0, activeStudents: 0, avgScore: 0 });

  useEffect(() => {
    fetchQuizzes();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await reportingService.getInstructorStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await quizService.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar role="Instructor" />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              Instructor <span className="text-indigo-500">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-lg">Create, manage and monitor your academic assessments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              className="px-8 py-3.5 text-lg flex items-center gap-3 shadow-indigo-500/20 shadow-lg"
              onClick={() => setShowWizard(true)}
            >
              <Plus size={24} /> Create New Quiz
            </Button>
          </motion.div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Quizzes', value: stats.totalQuizzes, icon: BookOpen, color: 'text-indigo-400' },
            { label: 'Active Students', value: stats.activeStudents, icon: Users, color: 'text-emerald-400' },
            { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: BarChart2, color: 'text-purple-400' },
          ].map((stat, i) => (
            <Card key={i} className="flex items-center gap-5 p-5 !bg-white/5 border-white/5">
              <div className={`p-4 rounded-2xl bg-slate-900/50 ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <LayoutGrid className="text-indigo-500" />
              Existing Quizzes
            </h2>
            <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
            <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showWizard ? (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QuizWizard onClose={() => { setShowWizard(false); fetchQuizzes(); }} />
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz, idx) => (
                    <motion.div
                      key={quiz._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="group h-full flex flex-col hover:border-indigo-500/30 transition-all duration-300">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                              Active
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this quiz?')) {
                                    try {
                                      await quizService.deleteQuiz(quiz._id);
                                      toast.success('Quiz deleted');
                                      fetchQuizzes();
                                    } catch (err) {
                                      toast.error('Failed to delete quiz');
                                    }
                                  }
                                }}
                                className="text-slate-500 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="text-slate-500 flex items-center gap-1.5 text-xs font-medium">
                                <Clock size={14} /> 20 mins
                              </div>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                            {quiz.title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                            {quiz.description || "No description provided."}
                          </p>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                            <List size={16} />
                            {quiz.questions.length} Questions
                          </div>
                          <Button className="!px-5 !py-2 text-sm !from-slate-800 !to-slate-800 border border-white/5 hover:border-indigo-500/50">
                            Details
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                      <BookOpen size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Quizzes Created</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">Get started by creating your first academic quiz to engage with your students.</p>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

const QuizWizard = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title) return toast.error('Title is required');
    const instructorId = localStorage.getItem('userId');

    setIsSaving(true);
    try {
      await quizService.createQuiz({
        title,
        description,
        instructorId,
        questions
      });
      toast.success('Quiz published successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('file', file);

      await quizService.importQuizDocx(formData);
      toast.success('Quiz imported from Word successfully!');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to import Word document. Ensure it follows the required format.';
      toast.error(msg);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="!bg-slate-900/40 border-indigo-500/20 max-w-4xl mx-auto overflow-visible relative">
      <button
        onClick={onClose}
        className="absolute -top-3 -right-3 w-10 h-10 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Plus size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Assessment</h2>
          <p className="text-slate-400 text-sm">Design a comprehensive quiz for your class</p>
        </div>
        <div className="ml-auto">
          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all text-sm font-bold">
            <Upload size={18} />
            Import DOCX
            <input type="file" accept=".docx" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Input
          label="Quiz Title"
          placeholder="e.g. Advanced JavaScript Patterns"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400 ml-1">Difficulty Level</label>
          <select className="premium-input appearance-none">
            <option>Intermediate</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-sm font-medium text-slate-400 ml-1 mb-2">Detailed Description</label>
        <textarea
          className="premium-input min-h-[120px] resize-none"
          placeholder="Explain the objectives and topics covered in this quiz..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-xl font-bold text-white">Questions Configuration</h3>
          <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
            {questions.length} Items
          </span>
        </div>

        {questions.map((q, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white/5 border border-white/5 rounded-2xl relative group"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                  {idx + 1}
                </div>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                  title="Remove Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Enter your question text here..."
                  value={q.text}
                  onChange={e => {
                    const newQs = [...questions];
                    newQs[idx].text = e.target.value;
                    setQuestions(newQs);
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="relative">
                      <input
                        className="premium-input !py-2 !pl-10 text-sm"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={e => {
                          const newQs = [...questions];
                          newQs[idx].options[oIdx] = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={20} /> Add New Question
        </button>
      </div>

      <div className="flex items-center gap-4 mt-12 pt-8 border-t border-white/5">
        <Button
          className="flex-1 py-4 text-lg"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Processing...' : 'Publish Assessment'}
        </Button>
        <Button
          className="flex-1 py-4 text-lg !from-slate-800 !to-slate-800 border border-white/5 hover:border-white/10"
          onClick={onClose}
        >
          Save to Drafts
        </Button>
      </div>
    </Card>
  );
};

export default InstructorDashboard;
