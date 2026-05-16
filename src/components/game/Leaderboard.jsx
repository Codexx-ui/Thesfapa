import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Trophy, Medal, Flame } from "lucide-react";

const MODE_EMOJI = { slap: "👋", punch: "👊", gun: "🔫" };

export default function Leaderboard({ currentUserEmail }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.HighScore.list("-score", 20)
      .then((data) => {
        if (data && data.length > 0) {
          setScores(data);
          setLoading(false);
        } else {
          return base44.entities.HighScore.list();
        }
      })
      .then((data) => {
        if (data) {
          // Sort and ensure we have unique IDs for React keys
          const sorted = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));
          setScores(sorted.slice(0, 20));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Leaderboard load failed:", err);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (i) => {
    if (i === 0) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (i === 1) return <Medal className="w-4 h-4 text-slate-400" />;
    if (i === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 text-center text-xs text-muted-foreground font-display">#{i + 1}</span>;
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm text-center py-4">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="w-full max-w-sm bg-card rounded-2xl p-4 border border-border text-center">
        <p className="font-display text-muted-foreground text-sm">Κανένα score ακόμα. Γίνε ο πρώτος!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-secondary" />
          <span className="font-display text-sm text-foreground uppercase">Global High Scores</span>
        </div>
        <span className="text-[10px] font-display text-muted-foreground uppercase tracking-widest">
          {scores.length} Found
        </span>
      </div>
      <div className="divide-y divide-border">
        {scores.map((s, i) => {
          const isMe = s.player_email === currentUserEmail;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-4 py-2.5 ${isMe ? "bg-primary/10" : ""}`}
            >
              <div className="flex items-center justify-center w-5">{getRankIcon(i)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <span className="font-display text-sm font-medium text-foreground">
                    {(() => {
                      const name = typeof s.player_name === 'object' 
                        ? (s.player_name?.display_name || s.player_name?.full_name || "Anonymous") 
                        : String(s.player_name || "");
                      
                      if (!name || name === "[object Object]") {
                        return s.player_email?.split("@")[0] || "Anonymous";
                      }
                      return name;
                    })()}
                    {isMe && <span className="text-[10px] text-primary ml-1">(Εσύ)</span>}
                  </span>
                  <span className="text-[9px] text-muted-foreground opacity-70 uppercase tracking-tighter">
                    {s.player_email?.replace(/(.{2})(.*)(@.*)/, "$1***$3")} • {s.created_at ? new Date(s.created_at).toLocaleTimeString() : "Now"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.mode && <span className="text-sm">{MODE_EMOJI[s.mode]}</span>}
                {s.max_combo > 1 && (
                  <span className="flex items-center gap-0.5 text-xs text-primary font-display">
                    <Flame className="w-3 h-3" />x{s.max_combo}
                  </span>
                )}
                <span className="font-display text-lg text-foreground">{s.score}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}