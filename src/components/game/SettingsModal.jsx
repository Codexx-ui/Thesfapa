import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Users, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  characters, 
  selectedCharacter, 
  onSelectCharacter, 
  isNightMode, 
  onToggleNightMode,
  volume,
  onVolumeChange,
  difficulty,
  onDifficultyChange,
  difficultySettings,
  language,
  onLanguageChange,
  isHighQuality,
  onToggleQuality,
  translations: t
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border-2 border-primary/20 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-foreground flex items-center gap-2 uppercase tracking-tight">
                <Palette className="w-6 h-6 text-primary" />
                {t.settings}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Language Selection */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Palette className="w-3 h-3" />
                  {t.language}
                </h3>
                <div className="flex gap-2">
                  {[["el", "Ελληνικά"], ["en", "English"]].map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => onLanguageChange(code)}
                      className={cn(
                        "flex-1 py-2 rounded-xl border-2 transition-all text-sm font-medium",
                        language === code ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Character Selection */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Users className="w-3 h-3" />
                  {t.character}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelectCharacter(c)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2",
                        selectedCharacter.id === c.id 
                          ? "border-primary bg-primary/5 scale-105 shadow-sm" 
                          : "border-transparent hover:bg-accent/50"
                      )}
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold truncate w-full text-center uppercase",
                        selectedCharacter.id === c.id ? "text-primary" : "text-muted-foreground"
                      )}>
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Audio Volume */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Sun className="w-3 h-3" />
                  {t.audio}
                </h3>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </section>

              {/* Difficulty */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Palette className="w-3 h-3" />
                  {t.difficulty}
                </h3>
                <div className="flex gap-2">
                  {Object.entries(difficultySettings).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => onDifficultyChange(key)}
                      className={cn(
                        "flex-1 py-2 rounded-xl border-2 transition-all text-[10px] font-bold uppercase",
                        difficulty === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      )}
                    >
                      {cfg.label[language]}
                    </button>
                  ))}
                </div>
              </section>

              {/* Theme & Quality */}
              <div className="grid grid-cols-2 gap-4">
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
                    {t.theme}
                  </h3>
                  <button
                    onClick={() => onToggleNightMode(!isNightMode)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                      isNightMode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    )}
                  >
                    {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase">{isNightMode ? "Night" : "Day"}</span>
                  </button>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
                    {t.quality}
                  </h3>
                  <button
                    onClick={() => onToggleQuality(!isHighQuality)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                      isHighQuality ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    )}
                  >
                    <span className="text-xs font-bold uppercase">{isHighQuality ? t.high : t.low}</span>
                  </button>
                </section>
              </div>
            </div>

            <Button 
              onClick={onClose}
              className="w-full mt-6 h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 uppercase tracking-widest"
            >
              {t.apply}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
