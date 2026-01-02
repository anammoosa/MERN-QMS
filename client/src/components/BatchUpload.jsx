import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle, FileUp, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8002/api';

const BatchUpload = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleUpload = async (type) => { // type: 'csv' or 'docx'
        if (!file) return;
        setLoading(true);
        setStatus({ type: '', message: '' });

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'csv'
            ? `${API_GATEWAY_URL}/quizzes/import/import-csv`
            : `${API_GATEWAY_URL}/quizzes/import-docx`;

        try {
            await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setStatus({ type: 'success', message: 'Batch processing started successfully!' });
            setFile(null);
            setTimeout(() => {
                if (onUploadComplete) onUploadComplete();
            }, 2000);
        } catch (e) {
            setStatus({ type: 'error', message: 'Processing failed: ' + (e.response?.data?.message || e.message) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-0 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <Database className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-wider">Batch Ingestion</h2>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div
                    className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 text-center group ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
                        }`}
                >
                    <input
                        type="file"
                        onChange={e => {
                            setFile(e.target.files[0]);
                            setStatus({ type: '', message: '' });
                        }}
                        accept=".csv, .docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="batch-file-upload"
                    />

                    <div className="flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            {file ? (
                                <motion.div
                                    key="file"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-4">
                                        <FileText className="text-emerald-400 w-8 h-8" />
                                    </div>
                                    <span className="text-emerald-400 font-bold text-lg mb-1">{file.name}</span>
                                    <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                                        {(file.size / 1024).toFixed(2)} KB • Ready for Ingestion
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
                                        <FileUp className="text-slate-400 group-hover:text-indigo-400 w-8 h-8 transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-300 mb-2">Drop your payload here</h3>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                                        Select a CSV or DOCX file to perform mass-provisioning of assessments.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400">CSV FORMAT</span>
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400">DOCX WORD</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`flex items-center gap-3 p-4 rounded-2xl border ${status.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}
                        >
                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <p className="text-sm font-bold tracking-tight">{status.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleUpload('csv')}
                        disabled={!file || loading}
                        className="premium-button bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center gap-2 group"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                            <>
                                <Database size={18} className="transition-transform group-hover:rotate-12" />
                                Process as CSV
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleUpload('docx')}
                        disabled={!file || loading}
                        className="premium-button bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center gap-2 group"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                            <>
                                <FileText size={18} className="transition-transform group-hover:rotate-12" />
                                Process as DOCX
                            </>
                        )}
                    </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 ml-1 flex items-center gap-2">
                        <AlertCircle size={12} /> Schema Architecture
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                        CSV: Question, Type, OptionA, OptionB, OptionC, OptionD, Answer, Points
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BatchUpload;
