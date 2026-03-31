import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BehaviorState = "ROAM" | "AVOID" | "PANIC" | "FLATTERED" | "COMFORT" | "ANNOYED" | "COOLDOWN";

interface PersonalityStats {
  ego: number;
  fear: number;
  patience: number;
}

interface SimulatorState {
  carX: number;
  carY: number;
  carAngle: number;
  state: BehaviorState;
  personality: PersonalityStats;
  speechBubble: string | null;
  personDetected: boolean;
  personX: number;
  personY: number;
}

const STATE_COLORS: Record<BehaviorState, string> = {
  ROAM: "hsl(var(--neon-green))",
  AVOID: "hsl(var(--neon-yellow))",
  PANIC: "hsl(var(--destructive))",
  FLATTERED: "hsl(var(--neon-pink))",
  COMFORT: "hsl(var(--neon-cyan))",
  ANNOYED: "hsl(var(--neon-orange))",
  COOLDOWN: "hsl(var(--muted-foreground))",
};

const STATE_EMOJIS: Record<BehaviorState, string> = {
  ROAM: "🟢",
  AVOID: "🟡",
  PANIC: "🔴",
  FLATTERED: "💖",
  COMFORT: "🤗",
  ANNOYED: "😤",
  COOLDOWN: "⏳",
};

const SPEECH_RESPONSES: Record<string, string[]> = {
  FLATTERED: ["You're making my GPU blush!", "Aww thank you!", "You're awesome too!"],
  COMFORT: ["It's going to be okay.", "I'm here with you.", "Stay strong!"],
  ANNOYED: ["Arghhh!", "Oh nooo!", "Give me space!"],
  PANIC: ["AHHH!", "No no no!", "Too close!"],
};

const JetRacerSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [sim, setSim] = useState<SimulatorState>({
    carX: 250,
    carY: 200,
    carAngle: 0,
    state: "ROAM",
    personality: { ego: 0, fear: 1, patience: 5 },
    speechBubble: null,
    personDetected: false,
    personX: 400,
    personY: 150,
  });

  const stateRef = useRef(sim);
  stateRef.current = sim;

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.4;
      utterance.volume = 1;
      // Try to pick a robotic-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('English'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const triggerState = useCallback((newState: BehaviorState) => {
    const responses = SPEECH_RESPONSES[newState];
    const bubble = responses ? responses[Math.floor(Math.random() * responses.length)] : null;

    setSim(prev => {
      const p = { ...prev.personality };
      if (newState === "FLATTERED") { p.ego += 1; p.fear = Math.max(0, p.fear - 0.1); }
      if (newState === "PANIC") { p.fear += 0.2; }
      if (newState === "ANNOYED") { p.patience = Math.max(0, p.patience - 1); }

      return { ...prev, state: newState, speechBubble: bubble, personality: p };
    });

    // Speak the bubble text out loud
    if (bubble) {
      speak(bubble);
      setTimeout(() => setSim(prev => ({ ...prev, speechBubble: null })), 2500);
    }

    setTimeout(() => setSim(prev => ({ ...prev, state: "ROAM" })), 3500);
  }, [speak]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let time = 0;

    const draw = () => {
      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Clear
      ctx.fillStyle = "hsl(220, 20%, 4%)";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "hsl(220, 15%, 12%)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Person (if detected)
      if (s.personDetected) {
        ctx.save();
        ctx.fillStyle = "hsl(220, 15%, 30%)";
        ctx.beginPath();
        ctx.arc(s.personX, s.personY - 25, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(s.personX - 8, s.personY - 13, 16, 30);
        // Detection ring
        ctx.strokeStyle = STATE_COLORS[s.state];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(s.personX, s.personY - 10, 40 + Math.sin(time * 0.05) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Car body
      ctx.save();
      ctx.translate(s.carX, s.carY);
      ctx.rotate(s.carAngle);

      // Shadow
      ctx.fillStyle = "hsl(0, 0%, 0%, 0.3)";
      ctx.fillRect(-18, -8, 36, 20);

      // Chassis
      const stateColor = STATE_COLORS[s.state];
      ctx.fillStyle = "hsl(220, 20%, 15%)";
      ctx.strokeStyle = stateColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, -12, 40, 24, 4);
      ctx.fill();
      ctx.stroke();

      // Wheels
      ctx.fillStyle = "hsl(220, 15%, 25%)";
      ctx.fillRect(-18, -15, 8, 4);
      ctx.fillRect(10, -15, 8, 4);
      ctx.fillRect(-18, 11, 8, 4);
      ctx.fillRect(10, 11, 8, 4);

      // LED eyes
      ctx.fillStyle = stateColor;
      ctx.shadowColor = stateColor;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(12, -4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Antenna
      ctx.strokeStyle = "hsl(220, 15%, 40%)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-12, -20); ctx.stroke();
      ctx.fillStyle = stateColor;
      ctx.shadowColor = stateColor;
      ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(-12, -20, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Speech bubble
      if (s.speechBubble) {
        ctx.save();
        const bx = s.carX + 30;
        const by = s.carY - 35;
        ctx.font = "11px 'Space Grotesk'";
        const tw = ctx.measureText(s.speechBubble).width;
        ctx.fillStyle = "hsl(220, 18%, 12%)";
        ctx.strokeStyle = stateColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx - 6, by - 14, tw + 12, 22, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "hsl(180, 10%, 90%)";
        ctx.fillText(s.speechBubble, bx, by);
        ctx.restore();
      }

      // State label
      ctx.save();
      ctx.font = "bold 11px 'Space Grotesk'";
      ctx.fillStyle = stateColor;
      ctx.textAlign = "center";
      ctx.fillText(`${STATE_EMOJIS[s.state]} ${s.state}`, s.carX, s.carY + 28);
      ctx.restore();

      time++;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSim(prev => {
        let { carX, carY, carAngle, state, personDetected, personX, personY } = prev;

        if (state === "ROAM") {
          carAngle += (Math.random() - 0.5) * 0.1;
          carX += Math.cos(carAngle) * 1.5;
          carY += Math.sin(carAngle) * 1.5;
        } else if (state === "AVOID") {
          const dx = carX - personX;
          const dy = carY - personY;
          const a = Math.atan2(dy, dx);
          carAngle = a;
          carX += Math.cos(a) * 2;
          carY += Math.sin(a) * 2;
        } else if (state === "PANIC") {
          carAngle += 0.15;
          carX += Math.cos(carAngle) * 3;
          carY += Math.sin(carAngle) * 3;
        }

        // Bounds
        carX = Math.max(25, Math.min(475, carX));
        carY = Math.max(25, Math.min(275, carY));

        // Random person appearance
        if (!personDetected && Math.random() < 0.005) {
          personDetected = true;
          personX = Math.random() * 400 + 50;
          personY = Math.random() * 200 + 50;
        }

        // Auto-detect proximity
        if (personDetected && state === "ROAM") {
          const dist = Math.hypot(carX - personX, carY - personY);
          if (dist < 60) {
            return { ...prev, carX, carY, carAngle, state: "AVOID", personDetected, personX, personY };
          }
        }

        return { ...prev, carX, carY, carAngle, personDetected, personX, personY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative rounded-lg border border-border overflow-hidden box-glow-cyan">
        <canvas ref={canvasRef} width={500} height={300} className="w-full" />
        <div className="absolute top-2 left-2 bg-card/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-muted-foreground">
          LIVE SIMULATION
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {(Object.keys(STATE_COLORS) as BehaviorState[]).map(state => (
          <button
            key={state}
            onClick={() => triggerState(state)}
            className="px-2 py-2 rounded-md border border-border bg-card text-xs font-mono transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: STATE_COLORS[state], color: STATE_COLORS[state] }}
          >
            {STATE_EMOJIS[state]} {state}
          </button>
        ))}
      </div>

      {/* Personality Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "EGO", value: sim.personality.ego, color: "hsl(var(--neon-pink))" },
          { label: "FEAR", value: sim.personality.fear.toFixed(1), color: "hsl(var(--neon-orange))" },
          { label: "PATIENCE", value: sim.personality.patience, color: "hsl(var(--neon-cyan))" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-3 text-center">
            <div className="text-xs font-mono text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JetRacerSimulator;
