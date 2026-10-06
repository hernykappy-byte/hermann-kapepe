import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface AchievementOverlayProps {
  badgeName: string;
  emoji: string;
  onClose: () => void;
}

export const AchievementOverlay: React.FC<AchievementOverlayProps> = ({ badgeName, emoji, onClose }) => {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C1294A', '#7B5EA7', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C1294A', '#7B5EA7', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -50 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
        className="relative z-10 bg-gradient-to-br from-[#1c113b] to-[#0a0514] border border-[#C1294A]/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(193,41,74,0.3)] flex flex-col items-center text-center max-w-sm w-full pointer-events-auto"
      >
        <div className="absolute -top-12">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
            className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-[#C1294A] rounded-full p-1 shadow-2xl"
          >
            <div className="w-full h-full bg-[#0a0514] rounded-full flex items-center justify-center text-4xl">
              {emoji}
            </div>
          </motion.div>
        </div>
        
        <div className="mt-12 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-xs font-bold uppercase tracking-widest"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Achievement Unlocked
            <Star className="w-3.5 h-3.5 fill-current" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-serif font-bold text-white capitalize"
          >
            {badgeName.replace(/_/g, ' ')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-slate-400 text-sm"
          >
            You've earned a new badge for your profile!
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
