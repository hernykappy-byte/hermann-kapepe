import React, { useState } from "react";
import { UserProfile, TeamProfile } from "../types";
import { Award, Trophy, Users, Globe, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";
import { WorldMap } from "./WorldMap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LeaderboardsProps {
  currentUser: UserProfile;
  teams: TeamProfile[];
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({ currentUser, teams }) => {
  const [activeTab, setActiveTab] = useState<"individual" | "teams" | "friends">("individual");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "all_time">("weekly");
  const [locationFilter, setLocationFilter] = useState<"all" | "local">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Simulated Weekly Activity Data
  const weeklyActivityData = [
    { day: "Mon", quizzes: 3 },
    { day: "Tue", quizzes: 5 },
    { day: "Wed", quizzes: 2 },
    { day: "Thu", quizzes: 7 },
    { day: "Fri", quizzes: 4 },
    { day: "Sat", quizzes: 6 },
    { day: "Sun", quizzes: 8 },
  ];

  // Simulated Individual Leaderboard Data
  const baseIndividualLeaderboard = [
    { rank: 1, username: "malama_m", displayName: "Malama Mutale", points: 4120, city: "London", country: "UK", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { rank: 2, username: "chansa_b", displayName: "Chansa Banda", points: 3890, city: "Tokyo", country: "Japan", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
    { rank: 3, username: "nkandu_k", displayName: "Nkandu Kapasa", points: 3750, city: "Paris", country: "France", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
    { rank: 4, username: "zulu_king", displayName: "Mwape Zulu", points: 3410, city: "Sydney", country: "Australia", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" },
    { rank: 5, username: "sarah_k", displayName: "Sarah Phiri", points: 3220, city: "Toronto", country: "Canada", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { rank: 6, username: "david_ch", displayName: "David Chilufya", points: 3100, city: "Berlin", country: "Germany", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { rank: 7, username: "h_kapepe", displayName: "Hermann Kapepe", points: currentUser.totalPoints, city: "New York", country: "USA", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { rank: 8, username: "tariro_zim", displayName: "Tariro Moyo", points: 2850, city: "Cape Town", country: "South Africa", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop" },
    { rank: 9, username: "mwenza_m", displayName: "Mwenza Mulenga", points: 2790, city: "Mumbai", country: "India", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
    { rank: 10, username: "tembo_k", displayName: "Kondwani Tembo", points: 2640, city: "Singapore", country: "Singapore", avatar: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=100&h=100&fit=crop" }
  ];

  // Dynamic Friends Leaderboard
  const baseFriendsLeaderboard = [
    { rank: 1, username: "chansa_b", displayName: "Chansa Banda", points: 3890, city: "Tokyo", country: "Japan", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
    { rank: 2, username: "h_kapepe", displayName: "Hermann Kapepe", points: currentUser.totalPoints, city: "New York", country: "USA", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { rank: 3, username: "david_ch", displayName: "David Chilufya", points: 3100, city: "Berlin", country: "Germany", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { rank: 4, username: "tembo_k", displayName: "Kondwani Tembo", points: 2640, city: "Singapore", country: "Singapore", avatar: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=100&h=100&fit=crop" }
  ];

  // Simulated Teams Leaderboard
  const baseTeamsLeaderboard = [
    { rank: 1, id: "t1", name: "Global Giants", type: "community" as const, totalPoints: 18450, locationCity: "London", locationCountry: "UK", logoUrl: "⚡", memberCount: 34 },
    { rank: 2, id: "t2", name: "Global Brains", type: "school" as const, totalPoints: 16900, locationCity: "New York", locationCountry: "USA", logoUrl: "🎓", memberCount: 48 },
    { rank: 3, id: "t3", name: "Marketing Stars", type: "company" as const, totalPoints: 14200, locationCity: "Tokyo", locationCountry: "Japan", logoUrl: "📈", memberCount: 22 },
    { rank: 4, id: "t4", name: "Pub Legends", type: "pub" as const, totalPoints: 11800, locationCity: "Sydney", locationCountry: "Australia", logoUrl: "🍻", memberCount: 15 },
    { rank: 5, id: "t5", name: "Strong Minds", type: "company" as const, totalPoints: 10500, locationCity: "Toronto", locationCountry: "Canada", logoUrl: "🧠", memberCount: 18 }
  ];

  // Sorting individual lists on runtime
  const getFilteredIndividuals = () => {
    let list = activeTab === "friends" ? baseFriendsLeaderboard : baseIndividualLeaderboard;

    // Adjust points of Herman Kapepe to reflect live points
    list = list.map(item => {
      if (item.username === "h_kapepe") {
        return { ...item, points: currentUser.totalPoints };
      }
      return item;
    });

    // Re-rank based on points
    list.sort((a, b) => b.points - a.points);
    list = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

    // Apply location filter
    if (locationFilter === "local") {
      list = list.filter(item => item.city === currentUser.locationCity);
    }

    // Apply search query
    if (searchQuery) {
      list = list.filter(
        item =>
          item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  };

  const getFilteredTeams = () => {
    let list = [...baseTeamsLeaderboard];

    // Re-rank based on points
    list.sort((a, b) => b.totalPoints - a.totalPoints);
    list = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

    // Apply location filter
    if (locationFilter === "local") {
      list = list.filter(item => item.locationCity === currentUser.locationCity);
    }

    // Apply search query
    if (searchQuery) {
      list = list.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  };

  return (
    <div id="leaderboard-root" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search and Filters Hub */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 backdrop-blur-md">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setActiveTab("individual"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "individual" ? "bg-[#C1294A] text-white shadow-md shadow-[#C1294A]/25" : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Global Leaderboard
            </button>
            <button
              onClick={() => { setActiveTab("teams"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "teams" ? "bg-[#C1294A] text-white shadow-md shadow-[#C1294A]/25" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Team Standings
            </button>
            <button
              onClick={() => { setActiveTab("friends"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "friends" ? "bg-[#C1294A] text-white shadow-md shadow-[#C1294A]/25" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4" />
              Friend Leagues
            </button>
          </div>

          {/* Location Filters */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-[#7B5EA7]" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as any)}
              className="bg-transparent border-none text-slate-300 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0F0A1E]">All Locations</option>
              <option value="local" className="bg-[#0F0A1E]">My City</option>
            </select>
          </div>
        </div>

        {/* Dynamic Period Buttons and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Period selectors */}
          <div className="flex gap-1.5 w-full sm:w-auto">
            {(["daily", "weekly", "monthly", "all_time"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  period === p
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/5 text-white/60 border-transparent hover:text-white"
                }`}
              >
                {p.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={activeTab === "teams" ? "Search teams..." : "Search players..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#7B5EA7] transition-all"
            />
          </div>
        </div>
      </div>

      {/* World Map Visualization */}
      <WorldMap />

      {/* Weekly Activity Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white mb-4">Weekly Quiz Activity</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#ffffff1a' }}
                contentStyle={{ backgroundColor: '#140D30', borderColor: '#ffffff1a', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#34d399' }}
              />
              <Bar dataKey="quizzes" fill="#10b981" radius={[4, 4, 0, 0]} name="Quizzes Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Standings List Panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-white/40 font-serif">
            Rankings ({period.replace("_", " ")})
          </span>
          <span className="text-xs font-mono text-[#7B5EA7]">
            {locationFilter === "local" ? "Local Area Stream" : "Worldwide Stream"}
          </span>
        </div>

        <div className="divide-y divide-white/10 max-h-[480px] overflow-y-auto">
          {activeTab !== "teams" ? (
            /* INDIVIDUAL LISTING */
            getFilteredIndividuals().map((entry) => {
              const isMe = entry.username === currentUser.username || entry.username === "h_kapepe";
              return (
                <div
                  key={entry.username}
                  className={`flex items-center justify-between px-6 py-4 transition-all ${
                    isMe ? "bg-[#C1294A]/10 border-l-4 border-l-[#C1294A]" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Position */}
                    <div className="w-8 flex justify-center">
                      {entry.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="font-mono text-sm font-bold text-slate-400">{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <img
                      src={entry.avatar}
                      alt={entry.displayName}
                      className="w-10 h-10 rounded-full border border-white/10 object-cover"
                    />

                    {/* Name/Username */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{entry.displayName}</span>
                        {isMe && (
                          <span className="bg-[#C1294A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        @{entry.username} • <MapPin className="w-3 h-3" /> {entry.city}, {entry.country}
                      </span>
                    </div>
                  </div>

                  {/* Points tally */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#C1294A] font-serif block">
                      {entry.points.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {entry.rank <= 3 ? "Champion Stream" : "Challenger Class"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            /* TEAMS STANDINGS LISTING */
            getFilteredTeams().map((team) => {
              const isMyTeam = team.id === "t2"; // Assumed Global Brains for Herman
              return (
                <div
                  key={team.id}
                  className={`flex items-center justify-between px-6 py-4 transition-all ${
                    isMyTeam ? "bg-[#7B5EA7]/10 border-l-4 border-l-[#7B5EA7]" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Position */}
                    <div className="w-8 flex justify-center">
                      {team.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : team.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : team.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="font-mono text-sm font-bold text-slate-400">{team.rank}</span>
                      )}
                    </div>

                    {/* Logo Visual */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                      {team.logoUrl}
                    </div>

                    {/* Team Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{team.name}</span>
                        <span className="bg-white/5 text-[#7B5EA7] text-[9px] font-bold px-2 py-0.5 rounded border border-white/10 capitalize">
                          {team.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        {team.memberCount} members • <MapPin className="w-3 h-3" /> {team.locationCity}, {team.locationCountry}
                      </span>
                    </div>
                  </div>

                  {/* Points Contribution */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#7B5EA7] font-serif block">
                      {team.totalPoints.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Accumulated Stream
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Empty state check */}
          {((activeTab === "teams" && getFilteredTeams().length === 0) ||
            (activeTab !== "teams" && getFilteredIndividuals().length === 0)) && (
            <div className="p-8 text-center text-slate-500">
              <Award className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No standings match your active search filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
