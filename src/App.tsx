import { useState, useEffect } from "react";
import { UserProfile, TeamProfile, ActivityFeedItem, Question } from "./types";
import { PlayQuiz } from "./components/PlayQuiz";
import { Leaderboards } from "./components/Leaderboards";
import { TeamsFeed } from "./components/TeamsFeed";
import { NoRepeatAdmin } from "./components/NoRepeatAdmin";
import { AchievementOverlay } from "./components/AchievementOverlay";
import { LiveTicker } from "./components/LiveTicker";
import { Zap, Trophy, Users, ShieldAlert, Award, LogOut, CheckCircle2, Target, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"play" | "standings" | "teams" | "admin">("play");
  const [showDailyGoalPopover, setShowDailyGoalPopover] = useState<boolean>(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{name: string, emoji: string} | null>(null);

  // State: Hermann Kapepe - Lead user profile matching the Platform Build context
  const [user, setUser] = useState<UserProfile>({
    username: "h_kapepe",
    displayName: "Hermann Kapepe",
    email: "Hernykappy@gmail.com",
    locationCity: "New York",
    locationCountry: "USA",
    totalPoints: 3050,
    currentStreak: 4,
    longestStreak: 14,
    badges: ["first_fire", "world_expert", "social_starter", "music_master"],
    teamId: "t2", // Global Brains
    pointsEarnedToday: 240
  });

  // State: Active teams list
  const [teams, setTeams] = useState<TeamProfile[]>([
    { id: "t1", name: "Global Giants", type: "community", totalPoints: 18450, locationCity: "London", locationCountry: "UK", logoUrl: "⚡", captainId: "malama_m", memberCount: 34 },
    { id: "t2", name: "Global Brains", type: "school", totalPoints: 16900, locationCity: "New York", locationCountry: "USA", logoUrl: "🎓", captainId: "h_kapepe", memberCount: 48 },
    { id: "t3", name: "Marketing Stars", type: "company", totalPoints: 14200, locationCity: "Tokyo", locationCountry: "Japan", logoUrl: "📈", captainId: "chansa_b", memberCount: 22 },
    { id: "t4", name: "Pub Legends", type: "pub", totalPoints: 11800, locationCity: "Sydney", locationCountry: "Australia", logoUrl: "🍻", captainId: "zulu_king", memberCount: 15 },
    { id: "t5", name: "Strong Minds", type: "company", totalPoints: 10500, locationCity: "Toronto", locationCountry: "Canada", logoUrl: "🧠", captainId: "sarah_k", memberCount: 18 }
  ]);

  // State: Community activities feed
  const [activities, setActivities] = useState<ActivityFeedItem[]>([
    {
      id: "act-1",
      username: "zulu_king",
      displayName: "Mwape Zulu",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      type: "quiz_completed",
      timestamp: "10 minutes ago",
      details: "scored 240 pts on the Global Trivia blitz with a 6-day streak!",
      emoji: "🌎",
      likes: 12,
      comments: [
        { username: "chansa_b", text: "Incredible score Mwape! High standard." }
      ]
    },
    {
      id: "act-2",
      username: "sarah_k",
      displayName: "Sarah Phiri",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      type: "badge_earned",
      timestamp: "1 hour ago",
      details: "unlocked the Category King badge for achieving 95% accuracy across 10 categories!",
      emoji: "🏆",
      likes: 24,
      comments: []
    },
    {
      id: "act-3",
      username: "tariro_zim",
      displayName: "Tariro Moyo",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
      type: "quiz_completed",
      timestamp: "4 hours ago",
      details: "secured a perfect 5/5 score on the World Heritage Championship Blitz!",
      emoji: "🔥",
      likes: 15,
      comments: [
        { username: "malama_m", text: "The future is smart! Congrats Tariro." }
      ]
    }
  ]);

  const [showDailyRewardToast, setShowDailyRewardToast] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem("lastLoginDate");

    if (lastLogin !== today) {
      // Award 50 points for first login of the day
      setUser((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints + 50,
        lastLoginDate: today
      }));
      localStorage.setItem("lastLoginDate", today);
      setShowDailyRewardToast(true);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowDailyRewardToast(false), 5000);
    }
  }, []);

  // Helper: append generated quiz questions to user activity
  const handleAddActivity = (details: string, type: "quiz_completed" | "badge_earned", emoji: string) => {
    if (type === "badge_earned") {
      const match = details.match(/unlocked the (.*) badge!/);
      const badgeName = match ? match[1] : "New Badge";
      setUnlockedBadge({ name: badgeName, emoji });
    }

    const newItem: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      type,
      timestamp: "Just now",
      details,
      emoji,
      likes: 0,
      comments: []
    };
    setActivities((prev) => [newItem, ...prev]);
  };

  const handleLikeActivity = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === activityId ? { ...act, likes: act.likes + 1 } : act))
    );
  };

  const handleAddComment = (activityId: string, text: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId
          ? { ...act, comments: [...act.comments, { username: user.username, text }] }
          : act
      )
    );
  };

  const handleJoinTeam = (teamId: string) => {
    // Add point contributions
    setUser((prev) => ({ ...prev, teamId }));
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId ? { ...team, memberCount: team.memberCount + 1 } : team
      )
    );
    handleAddActivity(`joined the ${teams.find((t) => t.id === teamId)?.name} team league roster!`, "team_joined" as any, "🤝");
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F3F4F6] flex flex-col antialiased">
      {/* Achievement Unlocked Overlay */}
      <AnimatePresence>
        {unlockedBadge && (
          <AchievementOverlay
            key="achievement"
            badgeName={unlockedBadge.name}
            emoji={unlockedBadge.emoji}
            onClose={() => setUnlockedBadge(null)}
          />
        )}
      </AnimatePresence>

      {/* Daily Login Reward Toast */}
      <AnimatePresence>
        {showDailyRewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#140D30] border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">Daily Login Bonus!</h4>
              <p className="text-[11px] text-emerald-400 font-mono">+50 pts added to your score</p>
            </div>
            <button 
              onClick={() => setShowDailyRewardToast(false)}
              className="ml-4 text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header / Navigation */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
        <LiveTicker />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Platform Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C1294A] rounded-xl flex items-center justify-center font-serif font-bold text-white text-xl tracking-tighter shadow-md">
                G
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white tracking-tight">
                  Grand Quiz
                </span>
                <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-widest leading-none">
                  The World Plays Grand
                </span>
              </div>
            </div>

            {/* Menu options */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("play")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "play" ? "bg-[#C1294A] text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                Blitz Play
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "standings" ? "bg-[#C1294A] text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="w-4 h-4" />
                Standings
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "teams" ? "bg-[#C1294A] text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                Teams & Feed
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "admin" ? "bg-[#C1294A] text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Engine Admin
              </button>
            </nav>

            {/* Right: Daily Goal & Profile & Code Download */}
            <div className="flex items-center gap-3 sm:gap-4 relative">

              {/* Direct Codebase Download */}
              <a
                href="/api/download-zip"
                download="grand-quiz-codebase.zip"
                className="flex items-center gap-1.5 bg-[#C1294A]/20 hover:bg-[#C1294A]/30 border border-[#C1294A]/40 text-rose-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm group"
                title="Download full project codebase as ZIP"
              >
                <Download className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-mono">Download Code</span>
                <span className="sm:hidden font-mono">ZIP</span>
              </a>
              
              {/* Daily Goal Widget */}
              <div className="relative">
                <button
                  onClick={() => setShowDailyGoalPopover(!showDailyGoalPopover)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-left transition-all text-xs cursor-pointer select-none"
                  title="Click to view daily target rewards!"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-slate-400 leading-none">
                      <span>Daily Goal</span>
                      <span className="text-emerald-400 font-bold">
                        {Math.round(((user.pointsEarnedToday || 0) / 500) * 100)}%
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-white leading-tight font-mono mt-0.5">
                      {user.pointsEarnedToday || 0}/500 pts
                    </span>
                  </div>
                  
                  {/* Small progress meter bar */}
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden relative hidden xs:block">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C1294A] to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.min(100, ((user.pointsEarnedToday || 0) / 500) * 100)}%` }}
                    />
                  </div>
                </button>

                {/* Popover */}
                {showDailyGoalPopover && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDailyGoalPopover(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 bg-[#140D30] border border-white/10 p-4 rounded-xl shadow-2xl z-50 space-y-3 backdrop-blur-xl animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="text-xs font-bold text-white">Daily Points Target</h4>
                          <p className="text-[10px] text-slate-400">Maintains peak streak rank</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>Progress:</span>
                          <span className="font-mono font-bold text-emerald-400">{(user.pointsEarnedToday || 0)} / 500 pts</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C1294A] to-emerald-400 transition-all duration-300"
                            style={{ width: `${Math.min(100, ((user.pointsEarnedToday || 0) / 500) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 leading-relaxed">
                        🎯 <strong>Active Boost Loop:</strong> Complete this 500 pts goal to earn extra XP multipliers, secure higher rankings in the Global Brains roster, and unlock weekly elite achievements!
                      </div>

                      <button
                        onClick={() => setShowDailyGoalPopover(false)}
                        className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all"
                      >
                        Got It
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Summary Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold block text-white">{user.displayName}</span>
                  <span className="text-[10px] text-[#C1294A] font-mono font-bold">
                    {user.totalPoints.toLocaleString()} pts
                  </span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  alt={user.displayName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#7B5EA7]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner or Streak Bar */}
      <div className="bg-white/5 border-b border-white/10 py-2 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] sm:text-xs">
          <span className="text-slate-400 font-mono truncate mr-2">
            Active: <span className="text-white font-semibold">@{user.username}</span> <span className="hidden sm:inline">({user.locationCity}, {user.locationCountry})</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap">
            <span className="flex items-center gap-1 text-orange-400 font-bold font-mono">
              🔥 {user.currentStreak} Days
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Best: {user.longestStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic sub-view render */}
        {activeTab === "play" && (
          <PlayQuiz
            user={user}
            onUpdateUser={setUser}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === "standings" && (
          <Leaderboards
            currentUser={user}
            teams={teams}
          />
        )}

        {activeTab === "teams" && (
          <TeamsFeed
            currentUser={user}
            teams={teams}
            activities={activities}
            onAddComment={handleAddComment}
            onLikeActivity={handleLikeActivity}
            onJoinTeam={handleJoinTeam}
          />
        )}

        {activeTab === "admin" && (
          <NoRepeatAdmin
            onAddGeneratedQuestions={(qs) => {
              // Add simulated points or trigger activity update for Herman
              handleAddActivity(`simulated and verified ${qs.length} new No-Repeat AI questions.`, "badge_earned" as any, "🔬");
            }}
          />
        )}

      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden sticky bottom-0 z-40 bg-black/80 backdrop-blur-md border-t border-white/10 py-2 px-4 flex justify-around items-center">
        <button
          onClick={() => setActiveTab("play")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === "play" ? "text-[#C1294A]" : "text-slate-400"
          }`}
        >
          <Zap className="w-5 h-5 fill-current" />
          Play
        </button>
        <button
          onClick={() => setActiveTab("standings")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === "standings" ? "text-[#C1294A]" : "text-slate-400"
          }`}
        >
          <Trophy className="w-5 h-5" />
          Standings
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === "teams" ? "text-[#C1294A]" : "text-slate-400"
          }`}
        >
          <Users className="w-5 h-5" />
          Teams
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === "admin" ? "text-[#C1294A]" : "text-slate-400"
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          Admin
        </button>
      </div>

      {/* Standardized professional Footer */}
      <footer className="border-t border-white/10 py-6 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
          <span>&copy; 2026 Grand Quiz. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="/api/download-zip"
              download="grand-quiz-codebase.zip"
              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Codebase (.zip)</span>
            </a>
            <span>•</span>
            <span>Global</span>
            <span>•</span>
            <span>"The World Plays Grand"</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
