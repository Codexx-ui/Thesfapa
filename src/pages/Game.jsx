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
import SettingsModal from "../components/game/SettingsModal";
import { Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { saveToLeaderboard } from "@/lib/githubLeaderboard";

const GAME_DURATION = 15;
const DIFFICULTY_SETTINGS = {
  easy: { window: 1200, label: { el: "Εύκολο", en: "Easy" } },
  medium: { window: 700, label: { el: "Μέτριο", en: "Medium" } },
  hard: { window: 400, label: { el: "Δύσκολο", en: "Hard" } }
};

const TRANSLATIONS = {
  el: {
    settings: "Ρυθμίσεις",
    character: "Επιλογή Στόχου",
    theme: "Θέμα Εμφάνισης",
    difficulty: "Δυσκολία",
    language: "Γλώσσα",
    audio: "Ένταση Ήχου",
    quality: "Ποιότητα Γραφικών",
    apply: "Εφαρμογή",
    high: "Υψηλή",
    low: "Χαμηλή",
    play: "ΠΑΙΞΕ ΤΩΡΑ",
    continue: "Συνέχεια",
    points: "Πόντοι",
    slaps: "Χτυπήματα",
    max_combo: "Max Combo",
    game_over: "ΤΕΛΟΣ ΠΑΙΧΝΙΔΙΟΥ",
    restart: "Ξαναπαίξε",
      instructions: {
        slap: "👋 Χτύπα τον στο πρόσωπο!",
        punch: "👊 Χτύπα τον στο πρόσωπο!",
        gun: "🔫 Ρίξ' του μερικές!"
      },
      nickname: "Όνομα Παίκτη",
      enter_name: "Γράψε το όνομά σου..."
    },
    en: {
    settings: "Settings",
    character: "Choose Target",
    theme: "Visual Theme",
    difficulty: "Difficulty",
    language: "Language",
    audio: "Audio Volume",
    quality: "Graphics Quality",
    apply: "Apply",
    high: "High",
    low: "Low",
    play: "PLAY NOW",
    continue: "Continue",
    points: "Points",
    slaps: "Hits",
    max_combo: "Max Combo",
    game_over: "GAME OVER",
    restart: "Play Again",
      instructions: {
        slap: "👋 Slap him in the face!",
        punch: "👊 Punch him!",
        gun: "🔫 Shoot him!"
      },
      nickname: "Player Name",
      enter_name: "Enter your nickname..."
    }
};

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
  const [gameState, setGameState] = useState("intro"); // intro | idle | playing | finishing | over
  const [character, setCharacter] = useState(CHARACTERS[2]);
  const [mode, setMode] = useState("slap"); // slap | punch | gun
  const [isNightMode, setIsNightMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // New Settings
  const [volume, setVolume] = useState(0.5);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("el");
  const [isHighQuality, setIsHighQuality] = useState(true);
  const [gameId, setGameId] = useState(0);
  const [nickname, setNickname] = useState(localStorage.getItem("slap_nickname") || "");
  const nicknameRef = useRef(localStorage.getItem("slap_nickname") || "");
  const scoreRef = useRef(0);
  const maxComboRef = useRef(0);

  const t = TRANSLATIONS[language];
  const comboWindow = DIFFICULTY_SETTINGS[difficulty].window;

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalSlaps, setTotalSlaps] = useState(0);
  const [hitCounts, setHitCounts] = useState({ slap: 0, punch: 0, gun: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentUser, setCurrentUser] = useState(null);
  const lastSlapTime = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const startGame = useCallback((customName) => {
    const nameToUse = customName || localStorage.getItem("slap_nickname") || nickname;
    if (nameToUse) {
      setNickname(nameToUse);
      nicknameRef.current = nameToUse;
      localStorage.setItem("slap_nickname", nameToUse);
    }
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setMaxCombo(0);
    maxComboRef.current = 0;
    setTotalSlaps(0);
    setHitCounts({ slap: 0, punch: 0, gun: 0 });
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    setGameId(id => id + 1);
    lastSlapTime.current = 0;
  }, [nickname]);

  const { toast } = useToast();

  const saveScore = useCallback(async () => {
    const finalName = nicknameRef.current || localStorage.getItem("slap_nickname") || "Ανώνυμος";
    const currentScore = scoreRef.current || 0;
    const currentMaxCombo = maxComboRef.current || 0;

    const ok = await saveToLeaderboard({
      player_name: String(finalName),
      score: Number(currentScore),
      max_combo: Number(currentMaxCombo),
    });

    if (!ok) {
      toast({
        variant: "destructive",
        title: "Αποτυχία αποθήκευσης",
        description: "Δεν ήταν δυνατή η αποθήκευση στο GitHub.",
      });
    }
  }, [toast]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => {
            saveScore();
            setGameState("over");
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, saveScore]);

  const handleSlap = useCallback(() => {
    if (gameState !== "playing") return;
    
    const now = Date.now();
    const timeSinceLastSlap = now - lastSlapTime.current;

    setTotalSlaps((prev) => prev + 1);
    setHitCounts((prev) => ({ ...prev, [mode]: prev[mode] + 1 }));

    const basePoints = mode === "gun" ? 50 : mode === "punch" ? 20 : 10;

    if (timeSinceLastSlap < comboWindow && lastSlapTime.current > 0) {
      setCombo((prev) => {
        const newCombo = prev + 1;
        const comboBonus = Math.floor(newCombo / 5);
        const totalPoints = basePoints + comboBonus;
        
        setMaxCombo((mc) => {
          const newMax = Math.max(mc, newCombo);
          maxComboRef.current = newMax;
          return newMax;
        });
        setScore((s) => {
          const newScore = s + totalPoints;
          scoreRef.current = newScore;
          return newScore;
        });
        return newCombo;
      });
    } else {
      setCombo(1);
      setScore((s) => {
        const newScore = s + basePoints;
        scoreRef.current = newScore;
        return newScore;
      });
    }

    lastSlapTime.current = now;
  }, [comboWindow, gameState, mode]);

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

      {/* Settings Toggle - Direct child of screen container for fixed positioning */}
      {(gameState === "idle" || gameState === "over") && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="fixed top-4 right-4 md:top-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-card/80 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.2)] border-2 border-primary/30 hover:border-primary hover:bg-card transition-all active:scale-90 z-[100]"
        >
          <SettingsIcon className="w-8 h-8 md:w-9 md:h-9 text-primary animate-spin-slow" />
        </Button>
      )}

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
            <SplashScreen 
              onStart={(name) => {
                const cleanName = name && String(name).trim() !== "" ? String(name).trim() : "Ανώνυμος";
                setNickname(cleanName);
                nicknameRef.current = cleanName;
                localStorage.setItem("slap_nickname", cleanName);
                setGameState("idle");
              }} 
            translations={t} 
            defaultNickname={(() => {
              const saved = localStorage.getItem("slap_nickname");
              return (saved && saved !== "[object Object]") ? saved : "";
            })()}
          />
        )}
        </AnimatePresence>

        {/* Character Selection - REPLACED BY SETTINGS MODAL */}
        
        {/* Title */}

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
                onClick={() => startGame()}
                size="lg"
                className="font-display text-xl h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
              >
                <Play className="w-6 h-6 mr-2" />
                {t.play}
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
                key={`${gameId}-${character.id}`}
                onSlap={handleSlap}
                disabled={gameState !== "playing"}
                mode={mode}
                targetImage={character.image}
                combo={combo}
                isNightMode={isNightMode}
                volume={volume}
                isHighQuality={isHighQuality}
              />

              {/* In-game weapon switcher */}
              <div className="flex gap-2 bg-card/80 backdrop-blur rounded-2xl p-2 shadow-inner border border-border">
                {[["slap","👋"],["punch","👊"],["gun", <img key="gun-img" src="https://img.icons8.com/color/512/gun.png" alt="gun" className="w-6 h-6 md:w-8 md:h-8 object-contain" />]].map(([m, icon]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "py-2 px-4 md:py-3 md:px-5 rounded-xl font-display text-xl md:text-2xl transition-all",
                      mode === m
                        ? "bg-primary text-primary-foreground shadow-md scale-105 md:scale-110"
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
                {mode === "punch" ? t.instructions.punch : mode === "gun" ? t.instructions.gun : t.instructions.slap}
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
          
          volume={volume}
          onVolumeChange={setVolume}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          difficultySettings={DIFFICULTY_SETTINGS}
          language={language}
          onLanguageChange={setLanguage}
          isHighQuality={isHighQuality}
          onToggleQuality={setIsHighQuality}
          translations={t}
        />

        {/* Finish Him Overlay - Positioned above target, appears at <= 3s */}
        <AnimatePresence>
          {gameState === "playing" && timeLeft <= 3 && timeLeft > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: 1,
                y: 0,
                rotate: [-2, 2, -2]
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ 
                duration: 0.2,
                rotate: { repeat: Infinity, duration: 0.1 }
              }}
              className="fixed top-[20%] left-0 right-0 z-[150] flex flex-col items-center justify-center pointer-events-none"
            >
              <h2 className="font-display text-6xl md:text-8xl text-primary drop-shadow-[0_0_20px_rgba(255,42,85,0.6)] italic uppercase tracking-tighter">
                FINISH HIM
              </h2>
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
              hitCounts={hitCounts}
              onRestart={startGame}
              onHome={() => setGameState("idle")}
              currentUserEmail={currentUser?.email}
              translations={t}
              mode={mode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}