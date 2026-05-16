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
  onToggleNightMode 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card border border-border p-6 rounded-3xl shadow-2xl z-[70]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-foreground flex items-center gap-2">
                <Palette className="w-6 h-6 text-primary" />
                Ρυθμίσεις
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-8">
              {/* Character Selection */}
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  Επιλογή Στόχου
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelectCharacter(c)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all border-2",
                        selectedCharacter.id === c.id 
                          ? "border-primary bg-primary/5 scale-105 shadow-lg" 
                          : "border-transparent hover:bg-accent/50"
                      )}
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium truncate w-full text-center",
                        selectedCharacter.id === c.id ? "text-primary" : "text-muted-foreground"
                      )}>
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Theme Selection */}
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                  {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  Θέμα Εμφάνισης
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => onToggleNightMode(false)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      !isNightMode ? "border-primary bg-primary/5 shadow-md" : "border-border hover:bg-accent"
                    )}
                  >
                    <Sun className={cn("w-5 h-5", !isNightMode ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-medium", !isNightMode ? "text-primary" : "text-muted-foreground")}>Day</span>
                  </button>
                  <button
                    onClick={() => onToggleNightMode(true)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      isNightMode ? "border-primary bg-primary/10 shadow-md" : "border-border hover:bg-accent"
                    )}
                  >
                    <Moon className={cn("w-5 h-5", isNightMode ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-medium", isNightMode ? "text-primary" : "text-muted-foreground")}>Night</span>
                  </button>
                </div>
              </section>
            </div>

            <Button 
              onClick={onClose}
              className="w-full mt-8 h-12 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
            >
              Εφαρμογή
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
