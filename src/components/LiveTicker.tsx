import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, TrendingUp, Users, Target } from "lucide-react";

const stats = [
  {
    id: 1,
    icon: <Users className="w-3 h-3 text-[#C1294A]" />,
    text: "12,450 players active now",
  },
  {
    id: 2,
    icon: <Target className="w-3 h-3 text-emerald-400" />,
    text: "89% success rate on Daily Global Challenge",
  },
  {
    id: 3,
    icon: <TrendingUp className="w-3 h-3 text-blue-400" />,
    text: "Geography category trending with +42% more plays",
  },
  {
    id: 4,
    icon: <Activity className="w-3 h-3 text-purple-400" />,
    text: "Server loads optimal • Zero repeat questions generated today",
  }
];

export const LiveTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0a0514]/80 border-b border-white/5 h-8 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-300"
        >
          {stats[currentIndex].icon}
          {stats[currentIndex].text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
