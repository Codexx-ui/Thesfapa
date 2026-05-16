import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hand, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import SlapTarget from "../components/game/SlapTarget";
import ScoreBoard from "../components/game/ScoreBoard";
import GameOverModal from "../components/game/GameOverModal";
import Leaderboard from "../components/game/Leaderboard";
import SplashScreen from "../components/game/SplashScreen";
import BackgroundMusic from "../components/game/BackgroundMusic";

const GAME_DURATION = 15;
const COMBO_WINDOW = 700;

export default function Game() {
  const [gameState, setGameState] = useState("intro"); // intro | idle | playing | over
  const [mode, setMode] = useState("slap"); // slap | punch | gun
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalSlaps, setTotalSlaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentUser, setCurrentUser] = useState(null);
  const lastSlapTime = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalSlaps(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    lastSlapTime.current = 0;
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState("over");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Save score when game ends
  useEffect(() => {
    if (gameState === "over" && currentUser) {
      base44.entities.HighScore.create({
        player_email: currentUser.email,
        player_name: currentUser.full_name || currentUser.email.split("@")[0],
        score,
        max_combo: maxCombo,
        total_slaps: totalSlaps,
        mode,
      });
    }
  }, [gameState]);

  const handleSlap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSlap = now - lastSlapTime.current;

    setTotalSlaps((prev) => prev + 1);

    if (timeSinceLastSlap < COMBO_WINDOW && lastSlapTime.current > 0) {
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((mc) => Math.max(mc, newCombo));
        setScore((s) => s + Math.max(1, newCombo));
        return newCombo;
      });
    } else {
      setCombo(1);
      setScore((s) => s + 1);
    }

    lastSlapTime.current = now;
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(350, 80%, 55%, 0.2), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[-10%] w-96 h-96 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(270, 70%, 60%, 0.2), transparent 70%)",
          }}
        />
      </div>

      <BackgroundMusic autoStart={gameState !== "intro"} />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <AnimatePresence>
          {gameState === "intro" && (
            <SplashScreen onStart={() => setGameState("idle")} />
          )}
        </AnimatePresence>

        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="font-display text-5xl md:text-6xl text-foreground tracking-tight uppercase">
            ΦΑΠΑ - ΞΑΠΛΑ
          </h1>
          <p className="font-display text-secondary text-lg mt-1 tracking-widest drop-shadow-sm uppercase">
            ✨ ΠΥΡΓΟΣ EDITION ✨
          </p>
        </motion.div>

        {/* Game area */}
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-9xl"
                >
                  😏
                </motion.div>
              </div>

              {/* Mode selector */}
              <div className="flex gap-2 bg-card rounded-2xl p-2 shadow-inner border border-border">
                <button
                  onClick={() => setMode("slap")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-display text-sm transition-all",
                    mode === "slap"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  👋 SLAP
                </button>
                <button
                  onClick={() => setMode("punch")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-display text-sm transition-all",
                    mode === "punch"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  👊 PUNCH
                </button>
                <button
                  onClick={() => setMode("gun")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-display text-sm transition-all",
                    mode === "gun"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  🔫 GUN
                </button>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="font-display text-xl h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
              >
                <Play className="w-6 h-6 mr-2" />
                START
              </Button>

              <div className="bg-card rounded-2xl p-4 shadow-lg border border-border max-w-xs text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hand className="w-5 h-5 text-primary" />
                  <span className="font-display text-sm text-foreground">HOW TO PLAY</span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Μην τον αφήσεις να πάρει ανάσα! Χτύπα τον στο πρόσωπο πριν αλλάξει μάσκα. Χτίσε combos "υποκριτικής" και δες το σκορ σου να ανεβαίνει στα ύψη. Προσοχή: Η παράσταση τελειώνει σε 15 δευτερόλεπτα!
                </p>
              </div>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-10 w-full"
            >
              <ScoreBoard
                score={score}
                combo={combo}
                timeLeft={timeLeft}
                maxTime={GAME_DURATION}
              />

              <SlapTarget onSlap={handleSlap} disabled={gameState !== "playing"} mode={mode} />

              {/* In-game weapon switcher */}
              <div className="flex gap-2 bg-card/80 backdrop-blur rounded-2xl p-2 shadow-inner border border-border">
                {[["slap","👋"],["punch","👊"],["gun","🔫"]].map(([m, icon]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "py-3 px-5 rounded-xl font-display text-2xl transition-all",
                      mode === m
                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-body text-sm text-muted-foreground"
              >
                {mode === "punch" ? "👊 Χτύπα τον στο πρόσωπο!" : mode === "gun" ? "🔫 Ρίξ' του μερικές!" : "👋 Χτύπα τον στο πρόσωπο!"}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        <AnimatePresence>
          {gameState === "over" && (
            <GameOverModal
              score={score}
              maxCombo={maxCombo}
              totalSlaps={totalSlaps}
              onRestart={startGame}
              onHome={() => setGameState("idle")}
              currentUserEmail={currentUser?.email}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}