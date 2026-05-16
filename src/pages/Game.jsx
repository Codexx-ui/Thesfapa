import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hand, Play, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import SlapTarget from "../components/game/SlapTarget";
import ScoreBoard from "../components/game/ScoreBoard";
import GameOverModal from "../components/game/GameOverModal";
import Leaderboard from "../components/game/Leaderboard";
import SplashScreen from "../components/game/SplashScreen";
import BackgroundMusic from "../components/game/BackgroundMusic";
import SettingsModal from "../components/game/SettingsModal";
import { Settings } from "lucide-react";

const GAME_DURATION = 15;
const COMBO_WINDOW = 700;

const CHARACTERS = [
  {
    id: "mitsotakis",
    name: "Μητσοτάκης",
    image: "https://cdn.britannica.com/86/209486-050-C862920A/Kyriakos-Mitsotakis-2019.jpg",
    bg: "https://upload.wikimedia.org/wikipedia/commons/1/14/Griechisches_Parlament.jpg",
    description: "Πύργος Edition"
  },
  {
    id: "adonis",
    name: "Άδωνης",
    image: "https://year-of-skills-greece.gr/wp-content/uploads/2024/02/GEORGIADIS20ADONIS-scaled.jpeg",
    bg: "https://upload.wikimedia.org/wikipedia/commons/1/14/Griechisches_Parlament.jpg",
    description: "Υπουργική Φάπα"
  },
  {
    id: "default",
    name: "Λέρα",
    image: "https://media.base44.com/images/public/6a02d2983989447500838a5e/15c2a163e_tar.jpeg",
    bg: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/86/cd/fe/atlantica-beach-resort.jpg",
    description: "Ο κλασικός στόχος"
  }
];

export default function Game() {
  const [gameState, setGameState] = useState("intro"); // intro | idle | playing | over
  const [character, setCharacter] = useState(CHARACTERS[0]);
  const [mode, setMode] = useState("slap"); // slap | punch | gun
  const [isNightMode, setIsNightMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

      <div className={cn(
        "fixed inset-0 pointer-events-none transition-opacity duration-1000",
        isNightMode ? "opacity-10 bg-black" : "opacity-40"
      )}>
        <img
          src={character.bg}
          alt="bg"
          className={cn(
            "w-full h-full object-cover transition-all duration-1000",
            isNightMode ? "grayscale brightness-50" : "grayscale-[0.2]"
          )}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <AnimatePresence>
          {gameState === "intro" && (
            <SplashScreen onStart={() => setGameState("idle")} />
          )}
        </AnimatePresence>

        {/* Character Selection (only in idle) - REPLACED BY SETTINGS MODAL */}
        
        {/* Settings Toggle (only in idle) */}
        {gameState === "idle" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-4 right-4 rounded-full bg-card/40 backdrop-blur-md shadow-lg border border-border/50 hover:bg-card/60 transition-all active:scale-90"
          >
            <Settings className="w-6 h-6 text-foreground" />
          </Button>
        )}

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
                  <img src="https://img.icons8.com/color/512/gun.png" alt="gun" className="w-5 h-5 inline-block mr-2" />
                  GUN
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

              <SlapTarget
                key={gameState === "playing" ? "playing" : "idle"}
                onSlap={handleSlap}
                disabled={gameState !== "playing"}
                mode={mode}
                targetImage={character.image}
                combo={combo}
                isNightMode={isNightMode}
              />

              {/* In-game weapon switcher */}
              <div className="flex gap-2 bg-card/80 backdrop-blur rounded-2xl p-2 shadow-inner border border-border">
                {[["slap","👋"],["punch","👊"],["gun", <img key="gun-img" src="https://img.icons8.com/color/512/gun.png" alt="gun" className="w-8 h-8 object-contain" />]].map(([m, icon]) => (
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

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          characters={CHARACTERS}
          selectedCharacter={character}
          onSelectCharacter={setCharacter}
          isNightMode={isNightMode}
          onToggleNightMode={setIsNightMode}
        />

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