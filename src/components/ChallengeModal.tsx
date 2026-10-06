import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Timer, CheckCircle2, XCircle, Swords } from "lucide-react";

interface ChallengeModalProps {
  rivalName: string;
  status: "pending" | "accepted" | "declined" | null;
  onClose: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ rivalName, status, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        className="relative z-10 bg-[#1c113b] border border-[#C1294A]/50 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full pointer-events-auto text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="mb-6 flex justify-center relative">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C1294A] to-[#7B5EA7] rounded-full p-1 shadow-lg shadow-[#C1294A]/30">
            <div className="w-full h-full bg-[#1c113b] rounded-full flex items-center justify-center">
              <Swords className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {status === "pending" && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -inset-2 border-2 border-dashed border-[#C1294A]/50 rounded-full"
            />
          )}
        </div>

        <h3 className="text-xl font-serif font-bold text-white mb-2">Live Challenge</h3>
        
        <AnimatePresence mode="wait">
          {status === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-slate-300 text-sm">
                Waiting for <span className="font-bold text-white">{rivalName}</span> to accept...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#C1294A] animate-pulse">
                <Timer className="w-4 h-4" />
                Negotiating connection
              </div>
            </motion.div>
          )}

          {status === "accepted" && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center text-emerald-400 mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <p className="text-emerald-300 text-sm font-medium">
                Challenge Accepted!
              </p>
              <p className="text-xs text-slate-400">
                Match starting in 3 seconds... Prepare yourself.
              </p>
            </motion.div>
          )}

          {status === "declined" && (
            <motion.div
              key="declined"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center text-slate-500 mb-2">
                <XCircle className="w-10 h-10" />
              </div>
              <p className="text-rose-300 text-sm font-medium">
                Challenge Declined or Missed
              </p>
              <p className="text-xs text-slate-400">
                {rivalName} is busy right now. Try again later.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
