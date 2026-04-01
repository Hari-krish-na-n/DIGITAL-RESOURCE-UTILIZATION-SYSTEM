import React, { useEffect, useState, useRef } from 'react';
import { useAI } from '../context/AIContext';
import { 
  Brain, 
  Target, 
  Award, 
  TrendingUp, 
  FileCheck, 
  Download, 
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  History,
  Info,
  Zap,
  Milestone,
  UserCheck,
  Rocket,
  Star,
  Send,
  MessageSquare,
  Bot,
  User
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export const AIProfile = () => {
  const { 
    score, report, recommendations, insights, learningPath, skillGaps, motivation, loading, error, 
    fetchAIScore, fetchAIReport, fetchCareerRecommendations, fetchAIInsights,
    fetchLearningPath, fetchSkillGaps, fetchMotivation, exportPDF, sendChatMessage
  } = useAI();

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Neural link established. I am your technical performance coach. Ask me anything about your scores, career path, or how to optimize your digital footprint.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    fetchAIScore();
    fetchAIReport();
    fetchCareerRecommendations();
    fetchAIInsights();
    fetchLearningPath();
    fetchSkillGaps();
    fetchMotivation();
  }, [fetchAIScore, fetchAIReport, fetchCareerRecommendations, fetchAIInsights, fetchLearningPath, fetchSkillGaps, fetchMotivation]);

  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!userInput.trim() || isChatting) return;
    const msg = userInput.trim();
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsChatting(true);
    
    try {
        const reply = await sendChatMessage(msg);
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Spectral interference detected. Re-establishing connection...' }]);
    } finally {
        setIsChatting(false);
    }
  };

  if (loading && !score) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-text-secondary font-medium animate-pulse">Running advanced AI forensics on your technical data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 max-w-[1400px] mx-auto px-6">
      {/* Header & Motivational Booster */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl shadow-xl shadow-emerald-500/5">
                <Brain className="w-12 h-12 text-emerald-500" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">AI Intelligence</span> Hub
            </h1>
            <p className="text-text-secondary mt-3 text-lg font-medium opacity-70">
              Next-gen skill forensics and predictive career mapping.
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportPDF}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all text-xs uppercase tracking-[0.2em]"
            >
              <Download className="w-5 h-5" />
              Export Dossier
            </motion.button>
          </div>
        </div>

        {motivation && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent border-l-4 border-emerald-500 rounded-r-3xl flex items-center justify-between group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-black text-text-primary leading-tight italic">"{motivation.message}"</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{motivation.status} Focus</span>
                  <span className="text-[10px] text-text-secondary font-black opacity-40 uppercase tracking-widest">• {motivation.streak} Day Momentum</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {error && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[1.5rem] flex items-center gap-4 text-rose-500 shadow-xl shadow-rose-500/5">
          <AlertCircle className="w-6 h-6" />
          <p className="text-sm font-black uppercase tracking-tighter">{error}</p>
        </div>
      )}

      {/* Primary Dash */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-black/5"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-10 flex items-center gap-2 relative z-10">
              <Award className="w-5 h-5 text-emerald-500" />
              Performance index
            </h2>
            <div className="flex flex-col items-center justify-center relative z-10">
              <div className="relative flex items-center justify-center scale-110">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-bg-card-alt" />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="currentColor"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray={691}
                    initial={{ strokeDashoffset: 691 }}
                    animate={{ strokeDashoffset: 691 - (691 * (score?.overall || 0)) / 10 }}
                    transition={{ duration: 2, ease: "circOut" }}
                    className="text-emerald-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-8xl font-black tracking-tighter text-text-primary leading-none">
                    {score?.overall || '0.0'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    <Rocket className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Peak Signal</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-5 relative z-10">
              {[
                { label: 'Problems', val: score?.raw.totalSolved, icon: Target, color: 'text-emerald-500' },
                { label: 'Courses', val: score?.raw.certsCount, icon: Milestone, color: 'text-blue-500' },
                { label: 'Repos', val: score?.raw.github?.repos, icon: History, color: 'text-purple-500' },
                { label: 'Stars', val: score?.raw.github?.stars, icon: Star, color: 'text-amber-500' }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-bg-card-alt/40 rounded-3xl border border-border-subtle/50 group/item hover:border-emerald-500/30 transition-all">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-2">
                    <item.icon className={cn("w-3.5 h-3.5 opacity-40", item.color)} /> {item.label}
                  </p>
                  <p className="text-2xl font-black text-text-primary tabular-nums tracking-tighter">{item.val || 0}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl shadow-black/5"
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-8 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              Skill alignment
            </h2>
            <div className="space-y-8">
              {skillGaps.map((gap, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-base font-black text-text-primary tracking-tight">{gap.role}</p>
                    <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{gap.match}%</span>
                  </div>
                  <div className="w-full h-3 bg-bg-card-alt rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${gap.match}%` }}
                       className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gap.missing.slice(0, 3).map((s, j) => (
                      <span key={j} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-bg-card-alt border border-border-subtle/50 text-text-secondary rounded-xl">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 flex flex-col h-full"
            >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    Intelligence Dossier
                  </h2>
                </div>

                {report && (
                  <div className="space-y-8 flex-1">
                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                        <Rocket className="w-12 h-12" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Core Forensics</h3>
                      <p className="text-lg leading-relaxed font-bold italic text-text-primary">"{report.summary}"</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Tactical Strengths
                            </h3>
                            <div className="space-y-3">
                                {report.strengths.slice(0, 3).map((s, i) => (
                                <div key={i} className="p-4 bg-bg-card-alt/40 border border-border-subtle/50 rounded-2xl font-bold text-xs flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span> {s}
                                </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Calibration Zones
                            </h3>
                            <div className="space-y-3">
                                {report.weaknesses.slice(0, 3).map((w, i) => (
                                <div key={i} className="p-4 bg-bg-card-alt/40 border border-border-subtle/50 rounded-2xl font-bold text-xs text-text-secondary flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">!</span> {w}
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}
            </motion.div>

            {/* AI Coaching Chat Box */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-0 shadow-2xl shadow-black/5 overflow-hidden flex flex-col h-[600px]"
            >
                <div className="p-8 border-b border-border-subtle bg-bg-card-alt/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight leading-none mb-1">Performance Coach</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Feedback Subnet</span>
                            </div>
                        </div>
                    </div>
                    <MessageSquare className="w-6 h-6 text-text-secondary opacity-20" />
                </div>

                <div 
                    ref={chatScrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
                >
                    <AnimatePresence initial={false}>
                        {chatMessages.map((msg, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex flex-col max-w-[85%] space-y-2",
                                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "p-5 rounded-3xl text-sm font-bold leading-relaxed shadow-sm",
                                    msg.role === 'user' 
                                        ? "bg-emerald-500 text-white rounded-tr-none" 
                                        : "bg-bg-card-alt border border-border-subtle rounded-tl-none text-text-primary"
                                )}>
                                    {msg.content}
                                </div>
                                <div className="flex items-center gap-2 opacity-30">
                                    {msg.role === 'assistant' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">{msg.role}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isChatting && (
                        <div className="flex items-center gap-3 text-text-secondary opacity-50 px-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Assistant is analyzing...</span>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-bg-card-alt/30 border-t border-border-subtle">
                    <div className="relative flex items-center gap-4">
                        <input 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="Ask about your performance..."
                            className="flex-1 h-14 bg-bg-card border border-border-subtle rounded-2xl px-6 font-bold text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-text-secondary placeholder:opacity-40"
                        />
                        <button 
                            onClick={handleSendChat}
                            disabled={isChatting || !userInput.trim()}
                            className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl shadow-black/5"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-4">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                Adaptive technical Roadmap
              </h2>
              <div className="px-4 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                Real-time Optimization
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {learningPath.map((wp, i) => (
                <div key={i} className="text-center group p-6 rounded-3xl hover:bg-bg-card-alt/50 transition-all border border-transparent hover:border-border-subtle">
                  <div className="w-14 h-14 bg-bg-card-alt border-2 border-border-subtle rounded-[1.25rem] flex items-center justify-center font-black text-xs mx-auto mb-6 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all shadow-lg">
                    W0{wp.week}
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-text-primary h-12 flex items-center justify-center leading-tight mb-4">{wp.focus}</h3>
                  <div className="space-y-2.5">
                    {wp.tasks.slice(0, 3).map((task, j) => (
                      <div key={j} className="p-3 bg-bg-card-alt/30 border border-border-subtle/30 rounded-xl text-[10px] font-bold text-text-secondary text-left group-hover:bg-white transition-all">
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
               className="bg-bg-card border border-border-subtle rounded-[2rem] p-10 shadow-2xl shadow-black/5 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-8">Career Trajectory Mapping</h2>
                <div className="space-y-4">
                    {recommendations.map((rec, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-bg-card-alt/50 rounded-2xl border border-border-subtle/50 group/row hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="font-black text-sm text-text-primary">{rec.role}</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{rec.fit} Fit</span>
                    </div>
                    ))}
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border-subtle/30 text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 opacity-50">
                <Briefcase className="w-4 h-4" /> Based on language proficiency sensors
              </div>
            </motion.div>

            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-emerald-600 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-emerald-500/30 relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 blur-[100px] -mr-40 -mt-40 rounded-full group-hover:bg-white/30 transition-all duration-1000" />
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-none">Neural Resume Matrix</h3>
                <p className="text-base font-bold text-white/80 italic pr-8">"Your decentralized career dossier is compiled and ready for deployment."</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportPDF}
                className="mt-10 px-10 py-5 bg-white text-emerald-600 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl relative z-10 hover:shadow-white/20 transition-all"
              >
                Compile Payload
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProfile;
