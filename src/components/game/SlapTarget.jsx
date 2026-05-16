import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { playHitSound } from "@/lib/soundEffects";

const FACE_IMAGE = "https://media.base44.com/images/public/6a02d2983989447500838a5e/15c2a163e_tar.jpeg";

const SLAP_EMOJIS = ["💥", "👋", "💫", "⭐", "🔥"];
const PUNCH_EMOJIS = ["💥", "👊", "💢", "⚡", "🔥"];
const GUN_EMOJIS = ["💥", "🔥", "⚡", "💢"];
const LERA_WORDS = ["Λεεεραα!", "Λεεεεραα!", "Λεεερααααα!", "Λεεεεερααααα!", "Λεεερααααααα!", "Λεεεεεεραααααααα!"];
const PAIN_FACES = ["😖", "😵", "🤕", "😫", "😣", "🥴", "😤"];
const DAMAGE_MARKS = [
  { top: "20%", left: "30%", size: 14 },
  { top: "45%", left: "60%", size: 18 },
  { top: "30%", left: "55%", size: 12 },
  { top: "60%", left: "35%", size: 16 },
  { top: "25%", left: "45%", size: 10 },
  { top: "55%", left: "20%", size: 20 },
  { top: "70%", left: "50%", size: 14 },
  { top: "40%", left: "75%", size: 12 },
];

// Inject CSS shake keyframe once
const SHAKE_STYLE = `
@keyframes slap-shake {
  0%   { transform: translate(0,0) rotate(0deg); }
  15%  { transform: translate(-6px,0) rotate(-3deg); }
  30%  { transform: translate(6px,0) rotate(3deg); }
  45%  { transform: translate(-4px,0) rotate(-2deg); }
  60%  { transform: translate(4px,0) rotate(2deg); }
  75%  { transform: translate(-2px,0) rotate(-1deg); }
  100% { transform: translate(0,0) rotate(0deg); }
}
.slap-shake { animation: slap-shake 0.35s ease-out; }
`;

if (!document.getElementById("slap-shake-style")) {
  const el = document.createElement("style");
  el.id = "slap-shake-style";
  el.textContent = SHAKE_STYLE;
  document.head.appendChild(el);
}

function FPSWeapon({ mode, fireKey }) {
  const anim =
    mode === "slap"   ? { x: [-20, 0], y: [20, 0], rotate: [-15, 0] } :
    mode === "punch"  ? { x: [-30, 0], y: [10, 0] } :
                        { y: [15, 0], rotate: [-5, 0] };
  const dur = mode === "gun" ? 0.08 : 0.15;
  const emoji = mode === "gun" ? "🔫" : mode === "punch" ? "👊" : "🤚";
  const flip = mode !== "gun" ? "scaleX(-1)" : undefined;

  return (
    <motion.div
      key={fireKey}
      className="fixed bottom-0 right-0 pointer-events-none z-40 select-none"
      animate={anim}
      transition={{ duration: dur }}
    >
      <div style={{ fontSize: "7rem", lineHeight: 1, transform: flip, filter: "drop-shadow(0 -4px 16px rgba(0,0,0,0.4))" }}>
        {emoji}
      </div>
    </motion.div>
  );
}

export default function SlapTarget({ onSlap, disabled, mode }) {
  const [floaters, setFloaters]     = useState([]);
  const [slapEffect, setSlapEffect] = useState(null);
  const [redFlash, setRedFlash]     = useState(0);   // counter → key for CSS anim
  const [painFace, setPainFace]     = useState(null);
  const [leraWord, setLeraWord]     = useState(null);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [handAnim, setHandAnim]     = useState(null);
  const [gunFiring, setGunFiring]   = useState(0);
  const [damageLevel, setDamageLevel] = useState(0);
  const [bruiseOpacity, setBruiseOpacity] = useState(0);
  const [shakeKey, setShakeKey]     = useState(0);   // retrigger CSS class

  const hitCountRef = useRef(0);
  const EMOJIS = mode === "punch" ? PUNCH_EMOJIS : mode === "gun" ? GUN_EMOJIS : SLAP_EMOJIS;

  const handleSlap = useCallback((e) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;

    hitCountRef.current += 1;
    setDamageLevel(Math.min(8, Math.floor(hitCountRef.current / 3)));
    setBruiseOpacity(Math.min(0.5, hitCountRef.current * 0.015));

    if (hitCountRef.current % 3 === 0) {
      const word = LERA_WORDS[Math.floor(Math.random() * LERA_WORDS.length)];
      setLeraWord({ text: word, id: Date.now() });
      setTimeout(() => setLeraWord(null), 700);
    }

    // Mode-specific effects
    if (mode === "gun") {
      setGunFiring((n) => n + 1);
      setMuzzleFlash(true);
      setTimeout(() => setMuzzleFlash(false), 100);
    } else {
      const side = x > 0 ? "right" : "left";
      setHandAnim({ id: Date.now(), side, mode });
      setTimeout(() => setHandAnim(null), 500);
    }

    playHitSound(mode);

    // Shake via CSS class retrigger
    setShakeKey((n) => n + 1);

    // Red flash via key
    setRedFlash((n) => n + 1);

    // Pain face
    setPainFace({ emoji: PAIN_FACES[Math.floor(Math.random() * PAIN_FACES.length)], id: Date.now() });
    setTimeout(() => setPainFace(null), 350);

    // Hit emoji burst
    const hitEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setSlapEffect({ emoji: hitEmoji, id: Date.now() });
    setTimeout(() => setSlapEffect(null), 400);

    // Floater
    const fid = Date.now() + Math.random();
    setFloaters((prev) => [...prev, { id: fid, x: Math.random() * 60 - 30, emoji: hitEmoji }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== fid)), 800);

    onSlap();
  }, [disabled, onSlap, mode, EMOJIS]);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Floating emoji effects */}
      {floaters.map((f) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 1, y: 0, x: f.x, scale: 0.5 }}
          animate={{ opacity: 0, y: -120, scale: 1.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 text-4xl pointer-events-none z-20"
        >
          {f.emoji}
        </motion.div>
      ))}

      {/* Hit flash emoji */}
      {slapEffect && (
        <motion.div
          key={slapEffect.id}
          initial={{ scale: 0.3, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute text-6xl pointer-events-none z-10"
        >
          {slapEffect.emoji}
        </motion.div>
      )}

      {/* Muzzle flash */}
      {muzzleFlash && (
        <motion.div
          key={`muzzle-${gunFiring}`}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="absolute text-5xl pointer-events-none z-30"
        >
          💥
        </motion.div>
      )}

      {/* Λέρα word burst */}
      {leraWord && (
        <motion.div
          key={leraWord.id}
          initial={{ scale: 0.3, opacity: 1, y: 0 }}
          animate={{ scale: 1.6, opacity: 0, y: -80 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute pointer-events-none z-50 font-display text-yellow-400 text-2xl text-center"
          style={{ textShadow: "0 0 12px rgba(255,200,0,0.9), 2px 2px 0 #000" }}
        >
          {leraWord.text}
        </motion.div>
      )}

      {/* Side hand animation */}
      {handAnim && (
        <motion.div
          key={handAnim.id}
          initial={{
            x: handAnim.side === "left" ? -160 : 160,
            y: handAnim.mode === "punch" ? 0 : -30,
            rotate: handAnim.mode === "punch"
              ? (handAnim.side === "left" ? -10 : 10)
              : (handAnim.side === "left" ? -40 : 40),
            opacity: 1,
          }}
          animate={{
            x: handAnim.side === "left" ? -40 : 40,
            y: handAnim.mode === "punch" ? 0 : -10,
            rotate: handAnim.mode === "punch" ? 0 : (handAnim.side === "left" ? -15 : 15),
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute text-7xl pointer-events-none z-30"
          style={{
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            transform: handAnim.side === "right" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          {handAnim.mode === "punch" ? "👊" : "🤚"}
        </motion.div>
      )}

      {/* Ring glow */}
      <motion.div
        className="absolute w-52 h-52 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(350, 80%, 55%, 0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Target face — shake via CSS, no framer-motion on this wrapper */}
      <div
        key={shakeKey}
        className={shakeKey > 0 ? "slap-shake" : ""}
      >
        <button
          onClick={handleSlap}
          disabled={disabled}
          className="relative w-44 h-44 rounded-full shadow-2xl border-4 border-primary/30 overflow-hidden cursor-pointer active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed z-10 active:scale-90 transition-transform duration-75"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <img
            src={FACE_IMAGE}
            alt="target"
            className="w-full h-full object-cover object-top"
            draggable={false}
          />

          {/* Bruise overlay */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 40%, rgba(120,0,0,${bruiseOpacity}) 0%, rgba(180,30,30,${bruiseOpacity * 0.6}) 60%, transparent 100%)`,
              transition: "background 0.3s",
            }}
          />

          {/* Damage marks */}
          {DAMAGE_MARKS.slice(0, damageLevel).map((mark, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: mark.top, left: mark.left,
                width: mark.size, height: mark.size,
                background: "radial-gradient(circle, rgba(160,0,0,0.85) 0%, rgba(100,0,0,0.5) 60%, transparent 100%)",
                boxShadow: "0 0 4px rgba(120,0,0,0.6)",
              }}
            />
          ))}

          {/* Red hit flash — CSS transition via key */}
          <motion.div
            key={redFlash}
            className="absolute inset-0 rounded-full bg-red-500"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Pain face */}
          {painFace && (
            <motion.div
              key={painFace.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-5xl pointer-events-none z-20"
            >
              {painFace.emoji}
            </motion.div>
          )}
        </button>
      </div>

      {/* FPS Weapon */}
      <FPSWeapon mode={mode} fireKey={mode === "gun" ? gunFiring : (handAnim?.id ?? 0)} />
    </div>
  );
}