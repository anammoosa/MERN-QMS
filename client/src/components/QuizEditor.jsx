import { useState } from 'react';
import { Plus, Trash2, Save, HelpCircle, AlignLeft, CheckSquare, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizEditor = ({ instructorId, onSave, isLoading }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [questions, setQuestions] = useState([]);

    const addQuestion = (type) => {
        setQuestions([...questions, {
            id: Date.now(),
            text: '',
            type,
            options: type === 'MCQ' || type === 'Multi-Select' ? ['', '', '', ''] : [],
            correctAnswer: type === 'Multi-Select' ? [] : '',
            points: 1
        }]);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const updateOption = (qId, oIdx, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[oIdx] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title || questions.length === 0) return;
        await onSave({ title, description, duration: Number(duration), questions, instructorId });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'MCQ': return <HelpCircle className="w-4 h-4" />;
            case 'Multi-Select': return <CheckSquare className="w-4 h-4" />;
            case 'True/False': return <AlignLeft className="w-4 h-4" />;
            default: return <Type className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Assessment Title</label>
                        <input
                            className="premium-input text-lg font-bold"
                            placeholder="Quantum Mechanics Midterm..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Context / Description</label>
                        <textarea
                            className="premium-input min-h-[100px] resize-none"
                            placeholder="Provide instructions or context for students..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Duration (Minutes)</label>
                        <input
                            className="premium-input"
                            type="number"
                            placeholder="60"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 h-[calc(100%-84px)] flex flex-col justify-center items-center text-center">
                        <p className="text-sm text-indigo-300 font-medium mb-4">Add modules to your architect</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button onClick={() => addQuestion('MCQ')} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-400 transition-all">
                                <Plus size={14} /> MCQ
                            </button>
                            <button onClick={() => addQuestion('Short Answer')} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-400 transition-all">
                                <Plus size={14} /> SHORT ANSWER
                            </button>
                            <button onClick={() => addQuestion('True/False')} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-400 transition-all">
                                <Plus size={14} /> T/F
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <AnimatePresence>
                    {questions.map((q, idx) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 relative group hover:border-indigo-500/20 transition-all"
                        >
                            <button
                                onClick={() => removeQuestion(q.id)}
                                className="absolute top-4 right-4 text-slate-600 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                                    {getIcon(q.type)}
                                    {q.type}
                                </span>
                                <span className="text-xs font-bold text-slate-500">MODULE #{idx + 1}</span>
                            </div>

                            <div className="space-y-4">
                                <input
                                    className="premium-input bg-transparent border-t-0 border-x-0 border-b-2 border-white/5 rounded-none px-0 focus:ring-0 focus:border-indigo-500/50 text-lg font-medium"
                                    placeholder="Enter your question prompt here..."
                                    value={q.text}
                                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                                />

                                {(q.type === 'MCQ' || q.type === 'Multi-Select') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3 group/opt">
                                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-slate-400 border border-white/10 group-focus-within/opt:border-indigo-500/50">
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <input
                                                    className="premium-input py-2"
                                                    placeholder={`Option ${oIdx + 1}`}
                                                    value={opt}
                                                    onChange={e => updateOption(q.id, oIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-4 flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Validation Key (Correct Answer)</label>
                                        <input
                                            className="premium-input bg-emerald-500/5 border-emerald-500/10 focus:border-emerald-500/50 text-emerald-400 font-bold"
                                            placeholder={q.type === 'Multi-Select' ? 'e.g. A,B,C' : 'Correct Answer'}
                                            value={Array.isArray(q.correctAnswer) ? q.correctAnswer.join(',') : q.correctAnswer}
                                            onChange={e => updateQuestion(q.id, 'correctAnswer', q.type === 'Multi-Select' ? e.target.value.split(',') : e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-2 block">Weight (Points)</label>
                                        <input
                                            className="premium-input text-center font-black"
                                            type="number"
                                            value={q.points}
                                            onChange={e => updateQuestion(q.id, 'points', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isLoading || !title || questions.length === 0}
                    className="premium-button min-w-[200px] flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={18} />
                            Publish Assessment
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default QuizEditor;
