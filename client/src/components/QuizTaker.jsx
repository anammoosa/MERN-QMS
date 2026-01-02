import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    CheckCircle2,
    Clock,
    HelpCircle,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Trophy,
    Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizTaker = ({ quiz, onFinish }) => {
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption(s) }
    const { submitQuiz } = useQuiz();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const questions = quiz.questions;
    const progress = ((currentStep + 1) / questions.length) * 100;

    const handleSelect = (questionId, option, type) => {
        if (type === 'Multi-Select') {
            const current = answers[questionId] || [];
            const newSelection = current.includes(option)
                ? current.filter(o => o !== option)
                : [...current, option];
            setAnswers({ ...answers, [questionId]: newSelection });
        } else {
            setAnswers({ ...answers, [questionId]: option });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = Object.keys(answers).map(qId => ({
                questionId: qId,
                selectedOptions: answers[qId]
            }));

            const response = await submitQuiz(quiz._id, payload);

            if (response.score !== undefined) {
                setResult(response);
                toast.success('Assessment evaluated successfully!');
            } else {
                setFeedback('Submission received! Your score is being calculated.');
                toast.success('Submitted for evaluation.');
            }
        } catch (e) {
            toast.error('Submission failed. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (result || feedback) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto glass-card flex flex-col items-center text-center p-12"
            >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${result ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                    {result ? <Trophy size={40} /> : <CheckCircle2 size={40} />}
                </div>

                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
                    {result ? 'Evaluation Complete' : 'Attempt Logged'}
                </h2>
                <p className="text-slate-400 mb-8 max-w-xs">
                    {result
                        ? 'Your performance has been analyzed and recorded efficiently.'
                        : 'Your answers have been securely transmitted for assessment.'}
                </p>

                {result && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-10 py-6 mb-8">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Final Score</p>
                        <p className="text-5xl font-black text-indigo-400">{result.score}<span className="text-2xl text-slate-600">%</span></p>
                    </div>
                )}

                <button
                    onClick={() => onFinish && onFinish()}
                    className="premium-button px-10"
                >
                    Return to Portal
                </button>
            </motion.div>
        );
    }

    const currentQ = questions[currentStep];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Quiz Progress Header */}
            <div className="glass-card p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                        <Target className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-200 line-clamp-1">{quiz.title}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Clock size={12} className="text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Step {currentStep + 1} of {questions.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
                        <p className="text-xs font-bold text-indigo-400">{Math.round(progress)}%</p>
                    </div>
                    <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (progress / 100) * 176} className="text-indigo-500 transition-all duration-500 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                            {currentStep + 1}/{questions.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card flex flex-col h-full"
                    >
                        <div className="p-8 md:p-10 flex-1">
                            <div className="flex items-start gap-4 mb-8">
                                <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400 font-bold shrink-0">
                                    Q{currentStep + 1}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-100">
                                    {currentQ.text}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {currentQ.type === 'MCQ' || currentQ.type === 'True/False' || currentQ.type === 'Multi-Select' ? (
                                    currentQ.options.map((opt, idx) => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer border transition-all duration-200 ${(currentQ.type === 'Multi-Select'
                                                    ? (answers[currentQ._id] || []).includes(opt)
                                                    : answers[currentQ._id] === opt)
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                                    : 'bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${(currentQ.type === 'Multi-Select'
                                                    ? (answers[currentQ._id] || []).includes(opt)
                                                    : answers[currentQ._id] === opt)
                                                    ? 'bg-indigo-500 border-indigo-500'
                                                    : 'border-slate-700'
                                                }`}>
                                                {(currentQ.type === 'Multi-Select'
                                                    ? (answers[currentQ._id] || []).includes(opt)
                                                    : answers[currentQ._id] === opt) && (
                                                        <CheckCircle2 size={14} className="text-white" />
                                                    )}
                                            </div>
                                            <input
                                                type={currentQ.type === 'Multi-Select' ? 'checkbox' : 'radio'}
                                                hidden
                                                checked={currentQ.type === 'Multi-Select' ? (answers[currentQ._id] || []).includes(opt) : answers[currentQ._id] === opt}
                                                onChange={() => handleSelect(currentQ._id, opt, currentQ.type)}
                                            />
                                            <span className="text-lg font-medium text-slate-300 capitalize">
                                                {opt}
                                            </span>
                                            <div className="ml-auto text-[10px] font-black text-slate-700 uppercase group-hover:text-slate-500 transition-colors">
                                                Option {String.fromCharCode(65 + idx)}
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <div className="space-y-4">
                                        <textarea
                                            className="premium-input min-h-[150px] resize-none text-lg p-6"
                                            placeholder="Compose your detailed response here..."
                                            value={answers[currentQ._id] || ''}
                                            onChange={e => handleSelect(currentQ._id, e.target.value, 'Short Answer')}
                                        />
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <AlertCircle size={14} />
                                            <span className="text-xs">Ensure your answer is clear and concise for optimal assessment.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="p-6 md:p-8 bg-white/5 border-t border-white/5 flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 p-3 rounded-xl text-slate-400 hover:bg-white/5 disabled:opacity-0 transition-all font-bold text-sm tracking-widest"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                PREVIOUS
                            </button>

                            {currentStep === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="premium-button px-12 h-12 flex items-center gap-2 group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            FINALIZE ATTEMPT
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    className="premium-button px-10 h-12 flex items-center gap-2 group"
                                >
                                    PROCEED
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Quick Jumper (Dots) */}
            <div className="flex justify-center gap-2 pb-10">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentStep === idx ? 'bg-indigo-400 w-8' : 'bg-slate-700 hover:bg-slate-500'
                            }`}
                        title={`Go to Question ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuizTaker;

