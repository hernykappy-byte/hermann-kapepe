import React, { useState } from "react";
import { CheckCircle2, Circle, Target, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";

interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: React.ReactNode;
  completed: boolean;
}

export const DailyMissions: React.FC = () => {
  // Hardcoded for UI demo
  const [missions] = useState<Mission[]>([
    {
      id: "m1",
      title: "Quiz Master",
      description: "Play 5 questions in any mode",
      progress: 3,
      total: 5,
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      completed: false
    },
    {
      id: "m2",
      title: "Team Player",
      description: "Join a new team or contribute 100 team pts",
      progress: 100,
      total: 100,
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      completed: true
    },
    {
      id: "m3",
      title: "Winning Streak",
      description: "Win a debate or score a perfect round",
      progress: 0,
      total: 1,
      icon: <Trophy className="w-5 h-5 text-[#C1294A]" />,
      completed: false
    }
  ]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-slate-300" />
        <h3 className="text-white font-bold font-serif text-lg tracking-tight">Daily Missions</h3>
        <span className="bg-[#C1294A]/20 text-[#C1294A] text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-auto">
          Resets in 12h
        </span>
      </div>

      <div className="space-y-3">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              mission.completed
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 p-2 bg-black/20 rounded-lg">
                {mission.icon}
              </div>
              <div>
                <h4 className={`text-sm font-bold ${mission.completed ? "text-emerald-400" : "text-white"}`}>
                  {mission.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{mission.description}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
              {mission.completed ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </div>
              ) : (
                <div className="text-[11px] font-mono font-bold text-slate-300">
                  {mission.progress} / {mission.total}
                </div>
              )}
              
              {!mission.completed && (
                <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C1294A] to-amber-400"
                    style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
