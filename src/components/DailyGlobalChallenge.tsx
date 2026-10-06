import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Timer, CheckCircle2, XCircle, TrendingUp, Users } from "lucide-react";
import confetti from "canvas-confetti";

export const DailyGlobalChallenge = () => {
  const [answered, setAnswered] = useState<boolean>(false);
  const [correct, setCorrect] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(14205);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [selectedOpt, setSelectedOpt] = useState<{ text: string; isCorrect: boolean; explanation: string } | null>(null);

  // Countdown timer logic to end of day
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ticker for global correct answers
  useEffect(() => {
    const ticker = setInterval(() => {
      setCorrectCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(ticker);
  }, []);

  const handleAnswer = (opt: { text: string; isCorrect: boolean; explanation: string }) => {
    setAnswered(true);
    setCorrect(opt.isCorrect);
    setSelectedOpt(opt);
    if (opt.isCorrect) {
      setCorrectCount(prev => prev + 1);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#C1294A', '#7B5EA7', '#10B981']
      });
    }
  };

  const question = "Which oceanic trench is known as the deepest part of the Earth's oceans?";
  const options = [
    { text: "A) Puerto Rico Trench", isCorrect: false, explanation: "The Puerto Rico Trench is the deepest in the Atlantic, not the entire Earth." },
    { text: "B) Mariana Trench", isCorrect: true, explanation: "The Mariana Trench is the deepest oceanic trench on Earth." },
    { text: "C) Tonga Trench", isCorrect: false, explanation: "The Tonga Trench is the second deepest trench on Earth." },
    { text: "D) Kuril-Kamchatka Trench", isCorrect: false, explanation: "The Kuril-Kamchatka Trench is in the northwest Pacific, but is not the deepest." },
  ];

  return (
    <div className="bg-gradient-to-br from-[#1c113b] to-[#0a0514] border border-[#C1294A]/30 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(193,41,74,0.15)] mb-8">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#C1294A] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#C1294A] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded animate-pulse">
              Live Now
            </span>
            <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Worldwide Event
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Daily Global Challenge</h2>
          <p className="text-sm text-slate-300 mt-1">One question. High stakes. +100 Points.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">Time Remaining</span>
            <div className="flex items-center gap-1.5 text-white font-mono font-bold">
              <Timer className="w-4 h-4 text-[#C1294A]" />
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">Correct Today</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
              <TrendingUp className="w-4 h-4" />
              {correctCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h3 className="text-xl md:text-2xl font-serif font-medium text-white leading-relaxed">
              {question}
            </h3>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {options.map((opt, idx) => (
                <motion.button
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 text-sm md:text-base font-medium px-4 py-4 rounded-xl text-left transition-colors shadow-sm"
                >
                  {opt.text}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl border ${correct ? "bg-emerald-950/20 border-emerald-500/30" : "bg-rose-950/20 border-rose-500/30"} text-center`}
          >
            {correct ? (
              <div className="space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-serif font-bold text-white">Brilliant!</h3>
                <p className="text-emerald-200/80 text-sm">You answered correctly and earned 100 points.</p>
                <div className="mt-4 p-4 bg-black/20 rounded-lg text-left text-emerald-200 text-sm">
                  <span className="font-semibold block mb-1">Explanation:</span>
                  {selectedOpt?.explanation}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                <h3 className="text-xl font-serif font-bold text-white">Not quite right</h3>
                <p className="text-rose-200/80 text-sm">The correct answer was B) Mariana Trench. Try again tomorrow!</p>
                <div className="mt-4 p-4 bg-black/20 rounded-lg text-left text-rose-200 text-sm">
                  <span className="font-semibold block mb-1">Explanation:</span>
                  {selectedOpt?.explanation}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-center items-center gap-2 text-xs text-slate-400 font-mono">
              <Users className="w-3.5 h-3.5" /> Join {correctCount.toLocaleString()} other players who conquered today's challenge.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
