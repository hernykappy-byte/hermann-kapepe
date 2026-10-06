import React, { useState } from "react";
import { UserProfile, TeamProfile, ActivityFeedItem } from "../types";
import { Users, Shield, Send, Heart, MessageSquare, Share2, Plus, Zap, Award, Sparkles, Swords } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChallengeModal } from "./ChallengeModal";

interface TeamsFeedProps {
  currentUser: UserProfile;
  teams: TeamProfile[];
  activities: ActivityFeedItem[];
  onAddComment: (activityId: string, text: string) => void;
  onLikeActivity: (activityId: string) => void;
  onJoinTeam: (teamId: string) => void;
}

export const TeamsFeed: React.FC<TeamsFeedProps> = ({
  currentUser,
  teams,
  activities,
  onAddComment,
  onLikeActivity,
  onJoinTeam
}) => {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [newTeamType, setNewTeamType] = useState<"school" | "company" | "friends" | "community" | "pub">("school");
  const [showCreateTeam, setShowCreateTeam] = useState<boolean>(false);
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  // 1-on-1 Challenge State
  const [challengedMember, setChallengedMember] = useState<string | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<"pending" | "accepted" | "declined" | null>(null);

  // Find user's active team if any
  const myTeam = teams.find((t) => t.id === currentUser.teamId);

  // Handle comment submit
  const submitComment = (activityId: string) => {
    const text = commentInputs[activityId]?.trim();
    if (!text) return;
    onAddComment(activityId, text);
    setCommentInputs({ ...commentInputs, [activityId]: "" });
  };

  // Simulated Team Challenger Format
  const challengeTeamSim = (rivalName: string) => {
    setFeedNotification(`Challenge sent to ${rivalName}! Format: 7-Day Accumulation. Result will post to the team feed once completing the window.`);
  };

  const initiateHeadToHead = (memberName: string) => {
    setChallengedMember(memberName);
    setChallengeStatus("pending");

    // Simulate response after a delay
    setTimeout(() => {
      setChallengeStatus(Math.random() > 0.3 ? "accepted" : "declined");
      
      // Auto close if accepted to "start match"
      setTimeout(() => {
        setChallengedMember(null);
        setChallengeStatus(null);
      }, 3000);
    }, 3000);
  };

  const closeChallengeModal = () => {
    setChallengedMember(null);
    setChallengeStatus(null);
  };

  return (
    <div id="teams-root" className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence>
        {challengedMember && (
          <ChallengeModal
            key="challenge-modal"
            rivalName={challengedMember}
            status={challengeStatus}
            onClose={closeChallengeModal}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Team Hub (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          {feedNotification && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-400 relative">
              <button onClick={() => setFeedNotification(null)} className="absolute top-2 right-2 text-emerald-400 hover:text-white font-bold">&times;</button>
              <p className="pr-4 leading-relaxed italic">{feedNotification}</p>
            </div>
          )}

          {myTeam ? (
            /* Active Team Page */
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-5 backdrop-blur-md">
              <div className="text-center space-y-2 pb-4 border-b border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto shadow-md shadow-[#C1294A]/5 animate-pulse">
                  🎓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">{myTeam.name}</h3>
                  <span className="bg-white/5 text-[#7B5EA7] text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border border-white/10">
                    {myTeam.type} League
                  </span>
                </div>
                <p className="text-xs text-slate-400 italic">"{myTeam.bio}"</p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Points</span>
                  <span className="text-sm font-bold text-[#C1294A]">{myTeam.totalPoints.toLocaleString()}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Rank</span>
                  <span className="text-sm font-bold text-[#7B5EA7]">#2</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Members</span>
                  <span className="text-sm font-bold text-white">{myTeam.memberCount}/50</span>
                </div>
              </div>

              {/* Member Roster (Simulated) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Users className="w-3.5 h-3.5 text-[#C1294A]" />
                  Member Contribution Roster
                </h4>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors">
                    <span className="font-semibold text-slate-200">Hermann Kapepe (Captain)</span>
                    <span className="font-mono text-emerald-400 font-bold">+{currentUser.totalPoints} pts</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors group">
                    <span className="text-slate-300">Chansa Banda</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 group-hover:hidden">+3,890 pts</span>
                      <button 
                        onClick={() => initiateHeadToHead("Chansa Banda")}
                        className="hidden group-hover:flex bg-[#C1294A]/20 text-[#C1294A] hover:bg-[#C1294A] hover:text-white px-2 py-1 rounded transition-colors items-center gap-1"
                        title="Challenge 1-on-1"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Duel</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors group">
                    <span className="text-slate-300">David Chilufya</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 group-hover:hidden">+3,100 pts</span>
                      <button 
                        onClick={() => initiateHeadToHead("David Chilufya")}
                        className="hidden group-hover:flex bg-[#C1294A]/20 text-[#C1294A] hover:bg-[#C1294A] hover:text-white px-2 py-1 rounded transition-colors items-center gap-1"
                        title="Challenge 1-on-1"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Duel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge other teams */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Launch Team Challenge
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => challengeTeamSim("Global Giants")}
                    className="p-2.5 bg-[#C1294A] hover:bg-[#D4345B] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all shadow-md shadow-[#C1294A]/10"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Sprint Battle
                  </button>
                  <button
                    onClick={() => challengeTeamSim("Strong Minds")}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/10 flex items-center justify-center gap-1 transition-all"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Accumulation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Join/Create Team Panel */
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 backdrop-blur-md">
              <div className="text-center space-y-1.5">
                <Users className="w-10 h-10 text-[#7B5EA7] mx-auto opacity-80" />
                <h3 className="text-base font-bold text-white font-serif">Unleash Team Power</h3>
                <p className="text-xs text-slate-300/80">
                  Every points you earn in daily quiz blitzes is instantly added to your school or corporate team's overall standings!
                </p>
              </div>

              {/* Recommended list */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#7B5EA7] font-mono">Recommended Teams</span>
                <div className="space-y-2">
                  {teams.slice(0, 3).map((team) => (
                    <div key={team.id} className="flex justify-between items-center p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{team.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{team.type} league • {team.locationCity}</span>
                      </div>
                      <button
                        onClick={() => onJoinTeam(team.id)}
                        className="bg-[#C1294A] hover:bg-[#D4345B] text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all"
                      >
                        Join Team
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show create button */}
              {!showCreateTeam ? (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 rounded-lg border border-white/10 flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Team
                </button>
              ) : (
                <div className="space-y-3 pt-3 border-t border-white/10 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Team Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Lusaka Quizmasters"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-slate-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#7B5EA7]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">League Type</label>
                    <select
                      value={newTeamType}
                      onChange={(e) => setNewTeamType(e.target.value as any)}
                      className="w-full bg-[#0F0A1E] border border-white/10 text-slate-200 text-xs rounded px-2 py-2"
                    >
                      <option value="school">School (Secondary / Uni)</option>
                      <option value="company">Company / Corporate</option>
                      <option value="pub">Pub / League</option>
                      <option value="friends">Friends League</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateTeam(false)}
                      className="flex-1 bg-white/5 text-slate-300 text-xs py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newTeamName) return;
                        setFeedNotification(`Team '${newTeamName}' created successfully! You are the Team Captain.`);
                        setShowCreateTeam(false);
                      }}
                      className="flex-1 bg-[#C1294A] text-white text-xs py-2 rounded font-bold"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Community Social Feed (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex justify-between items-center backdrop-blur-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Sparkles className="w-4 h-4 text-[#C1294A]" />
              Global Social Feed
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Updates</span>
          </div>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            <AnimatePresence>
              {activities.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden backdrop-blur-md"
                >
                  {/* Activity header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={act.avatarUrl}
                        alt={act.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{act.displayName}</span>
                          <span className="text-[10px] text-slate-400">@{act.username}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{act.timestamp}</span>
                      </div>
                    </div>
                    <span className="text-lg bg-white/5 p-1.5 rounded-lg border border-white/10">
                      {act.emoji}
                    </span>
                  </div>

                  {/* Activity main body */}
                  <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-medium italic">
                    {act.details}
                  </p>

                  {/* Actions (Likes, comments) */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/10 text-xs text-slate-400">
                    <button
                      onClick={() => onLikeActivity(act.id)}
                      className="flex items-center gap-1 hover:text-[#C1294A] transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#C1294A]" />
                      <span>{act.likes}</span>
                    </button>
                    <span className="flex items-center gap-1 font-mono">
                      <MessageSquare className="w-3.5 h-3.5 text-[#7B5EA7]" />
                      <span>{act.comments.length} Comments</span>
                    </span>
                  </div>

                  {/* Comments section */}
                  {act.comments.length > 0 && (
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-2">
                      {act.comments.map((comm, idx) => (
                        <div key={idx} className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">@{comm.username}</span>
                            <span className="text-[9px] text-slate-400">replied</span>
                          </div>
                          <p className="text-slate-300 pl-1 leading-normal italic">
                            "{comm.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input comment */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Comment on this achievement (max 140 chars)..."
                      maxLength={140}
                      value={commentInputs[act.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && submitComment(act.id)}
                      className="flex-1 bg-white/5 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#7B5EA7]"
                    />
                    <button
                      onClick={() => submitComment(act.id)}
                      className="bg-[#C1294A] hover:bg-[#D4345B] text-white p-2 rounded-lg transition-all flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
