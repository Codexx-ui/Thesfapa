import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export default function SplashScreen({ onStart, translations: t, defaultNickname = "" }) {
  const [inputName, setInputName] = useState(defaultNickname);

  const handleStart = () => {
    const finalName = inputName.trim() || defaultNickname.trim() || "";
    onStart(finalName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#0d0d12] p-6 text-center"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #ff2a55, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-lg space-y-4 md:space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display text-5xl md:text-8xl text-white tracking-tighter mb-1 drop-shadow-[0_0_20px_rgba(255,42,85,0.5)]">
            ΦΑΠΑ <span className="text-primary">ΞΑΠΛΑ</span>
          </h1>
          <p className="font-display text-primary text-lg md:text-2xl tracking-[0.2em] font-bold">
            ✨ ΠΥΡΓΟΣ EDITION ✨
          </p>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-body text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto"
        >
          {t.language === "en"
            ? "Play now! Show your reflexes and give the strongest slap to Corruption."
            : "Παίξε τώρα! Δείξε τα αντανακλαστικά σου και ρίξε την πιο δυνατή φάπα στην Διαφθορά."}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-[240px] mx-auto w-full space-y-1"
        >
          <label className="text-[10px] font-display text-primary uppercase tracking-widest block text-left ml-2 opacity-70">
            {t.nickname}
          </label>
          <input
            type="text"
            value={inputName}
            placeholder={t.enter_name}
            className="w-full h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-white font-display text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
            onChange={(e) => setInputName(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <Button
            onClick={handleStart}
            size="lg"
            className="group relative font-display text-xl h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(255,42,85,0.4)] transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping group-hover:animate-none opacity-0 group-hover:opacity-10" />
            <Play className="w-6 h-6 mr-2 fill-current" />
            {t.continue}
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 text-muted-foreground/50 font-body text-[10px] md:text-xs tracking-wide px-4 max-w-2xl"
      >
        Οποιαδήποτε ομοιότητα με πρόσωπα, καταστάσεις ή γεγονότα είναι εντελώς συμπτωματική και δεν ανταποκρίνεται στην πραγματικότητα. Αν όμως νομίζεις ότι κάτι σου θυμίζει... μάλλον έχεις δίκιο.
      </motion.div>
    </motion.div>
  );
}
