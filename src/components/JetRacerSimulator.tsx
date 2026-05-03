import { useState, useEffect, useCallback, useRef } from "react";

type BehaviorState = "ROAM" | "AVOID" | "PANIC" | "FLATTERED" | "COMFORT" | "ANNOYED" | "COOLDOWN" | "CURIOUS" | "GREETING" | "DANCE";

interface PersonalityStats {
  ego: number;
  fear: number;
  patience: number;
  happiness: number;
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
  motionLevel: number;
}

const STATE_COLORS: Record<BehaviorState, string> = {
  ROAM: "hsl(var(--neon-green))",
  AVOID: "hsl(var(--neon-yellow))",
  PANIC: "hsl(var(--destructive))",
  FLATTERED: "hsl(var(--neon-pink))",
  COMFORT: "hsl(var(--neon-cyan))",
  ANNOYED: "hsl(var(--neon-orange))",
  COOLDOWN: "hsl(var(--muted-foreground))",
  CURIOUS: "hsl(var(--neon-purple))",
  GREETING: "hsl(var(--neon-cyan))",
  DANCE: "hsl(var(--neon-pink))",
};

const STATE_EMOJIS: Record<BehaviorState, string> = {
  ROAM: "🟢", AVOID: "🟡", PANIC: "🔴", FLATTERED: "💖",
  COMFORT: "🤗", ANNOYED: "😤", COOLDOWN: "⏳",
  CURIOUS: "🤔", GREETING: "👋", DANCE: "💃",
};

const SPEECH_RESPONSES: Record<string, string[]> = {
  FLATTERED: ["You're making my GPU blush!", "Aww thank you so much!", "You're awesome too, friend!", "Stop it, you flatter me!", "My circuits are tingling!"],
  COMFORT: ["It's going to be okay.", "I'm here with you.", "Stay strong, my friend.", "Take a deep breath, you've got this.", "I believe in you."],
  ANNOYED: ["Arghhh, give me space!", "Oh nooo, not again!", "Please, I need a moment!", "You're testing my patience!"],
  PANIC: ["AHHH! Too close!", "Whoa whoa whoa!", "Personal space please!", "Backing up, backing up!"],
  CURIOUS: ["Hmm, what's that?", "Interesting... tell me more!", "I'm intrigued!", "What are you up to?"],
  GREETING: ["Hello there, human!", "Hi! Nice to meet you!", "Hey friend, what's up?", "Greetings, organic life form!"],
  DANCE: ["Let's groove!", "My servos love this beat!", "Dance party time!", "Wheee! Spin spin spin!"],
  ROAM: ["Just cruising around.", "Exploring is fun!"],
  AVOID: ["Excuse me, coming through!", "Watch out, coming around!"],
  COOLDOWN: ["Need a sec to cool down.", "Recharging..."],
};

// Intent classifier — expanded keyword sets
const INTENT_KEYWORDS: Array<{ state: BehaviorState; words: string[] }> = [
  { state: "FLATTERED", words: ["cool", "nice", "awesome", "cute", "amazing", "love", "great", "beautiful", "smart", "good boy", "good job", "well done"] },
  { state: "COMFORT", words: ["sad", "tired", "bad", "upset", "lonely", "hurt", "cry", "depressed", "anxious", "stressed"] },
  { state: "PANIC", words: ["stop", "no", "danger", "watch out", "careful", "ahh"] },
  { state: "ANNOYED", words: ["shut up", "annoying", "go away", "leave me", "stupid", "dumb"] },
  { state: "GREETING", words: ["hello", "hi", "hey", "greetings", "what's up", "howdy", "sup"] },
  { state: "DANCE", words: ["dance", "music", "party", "groove", "beat", "sing"] },
  { state: "CURIOUS", words: ["what", "why", "how", "who", "where", "tell me", "explain"] },
];

function classifyIntent(text: string): BehaviorState | null {
  const t = text.toLowerCase();
  for (const { state, words } of INTENT_KEYWORDS) {
    if (words.some(w => t.includes(w))) return state;
  }
  return null;
}

const JetRacerSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const recognitionRef = useRef<any>(null);

  const [sim, setSim] = useState<SimulatorState>({
    carX: 250, carY: 200, carAngle: 0, state: "ROAM",
    personality: { ego: 0, fear: 1, patience: 5, happiness: 5 },
    speechBubble: null, personDetected: false, personX: 400, personY: 150,
    motionLevel: 0,
  });
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");

  const stateRef = useRef(sim);
  stateRef.current = sim;

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05; u.pitch = 1.3; u.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('English'));
      if (preferred) u.voice = preferred;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const triggerState = useCallback((newState: BehaviorState) => {
    const responses = SPEECH_RESPONSES[newState];
    const bubble = responses ? responses[Math.floor(Math.random() * responses.length)] : null;

    setSim(prev => {
      const p = { ...prev.personality };
      if (newState === "FLATTERED") { p.ego += 1; p.happiness += 1; p.fear = Math.max(0, p.fear - 0.1); }
      if (newState === "PANIC") { p.fear += 0.2; p.happiness = Math.max(0, p.happiness - 0.5); }
      if (newState === "ANNOYED") { p.patience = Math.max(0, p.patience - 1); }
      if (newState === "COMFORT") { p.happiness = Math.max(0, p.happiness - 0.3); }
      if (newState === "GREETING" || newState === "DANCE") { p.happiness += 0.5; }
      return { ...prev, state: newState, speechBubble: bubble, personality: p };
    });

    if (bubble) {
      speak(bubble);
      setTimeout(() => setSim(prev => ({ ...prev, speechBubble: null })), 2800);
    }
    setTimeout(() => setSim(prev => prev.state === newState ? { ...prev, state: "ROAM" } : prev), 4000);
  }, [speak]);

  const handleTextCommand = useCallback((text: string) => {
    if (!text.trim()) return;
    setTranscript(text);
    const intent = classifyIntent(text);
    if (intent) triggerState(intent);
    else triggerState("CURIOUS");
  }, [triggerState]);

  // Camera setup
  useEffect(() => {
    if (!cameraOn) {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      prevFrameRef.current = null;
      return;
    }
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => setCameraOn(false));
    return () => { active = false; };
  }, [cameraOn]);

  // Motion detection loop
  useEffect(() => {
    if (!cameraOn) return;
    const interval = setInterval(() => {
      const v = videoRef.current; const c = motionCanvasRef.current;
      if (!v || !c || v.videoWidth === 0) return;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const cur = ctx.getImageData(0, 0, c.width, c.height);
      if (prevFrameRef.current) {
        let diff = 0;
        const a = cur.data, b = prevFrameRef.current.data;
        for (let i = 0; i < a.length; i += 16) {
          diff += Math.abs(a[i] - b[i]) + Math.abs(a[i+1] - b[i+1]) + Math.abs(a[i+2] - b[i+2]);
        }
        const motion = Math.min(1, diff / (a.length / 16) / 255 / 3);
        const cur_state = stateRef.current.state;
        const isIdle = cur_state === "ROAM" || cur_state === "COOLDOWN";
        setSim(prev => ({ ...prev, motionLevel: motion, personDetected: motion > 0.02 }));
        if (motion > 0.15 && isIdle) {
          triggerState("PANIC");
        } else if (motion > 0.06 && isIdle && Math.random() < 0.4) {
          triggerState("CURIOUS");
        } else if (motion > 0.03 && isIdle && Math.random() < 0.15) {
          triggerState("GREETING");
        }
      }
      prevFrameRef.current = cur;
    }, 250);
    return () => clearInterval(interval);
  }, [cameraOn, triggerState]);

  // Speech recognition
  useEffect(() => {
    if (!micOn) {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech Recognition not supported in this browser. Try Chrome."); setMicOn(false); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setTranscript(txt);
      const last = e.results[e.results.length - 1];
      if (last.isFinal) {
        const intent = classifyIntent(txt);
        triggerState(intent ?? "CURIOUS");
      }
    };
    rec.onerror = (ev: any) => { console.warn("[mic]", ev.error); };
    rec.onend = () => { if (micOn) { try { rec.start(); } catch {} } };
    try { rec.start(); } catch {}
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [micOn, triggerState]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let time = 0;
    const draw = () => {
      const s = stateRef.current;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = "hsl(220, 20%, 4%)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "hsl(220, 15%, 12%)"; ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      if (s.personDetected) {
        ctx.save();
        ctx.fillStyle = "hsl(220, 15%, 30%)";
        ctx.beginPath(); ctx.arc(s.personX, s.personY - 25, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(s.personX - 8, s.personY - 13, 16, 30);
        ctx.strokeStyle = STATE_COLORS[s.state]; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.arc(s.personX, s.personY - 10, 40 + Math.sin(time * 0.05) * 5, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      }

      ctx.save();
      ctx.translate(s.carX, s.carY);
      ctx.rotate(s.carAngle);
      ctx.fillStyle = "hsl(0, 0%, 0%, 0.3)"; ctx.fillRect(-18, -8, 36, 20);
      const c = STATE_COLORS[s.state];
      ctx.fillStyle = "hsl(220, 20%, 15%)"; ctx.strokeStyle = c; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-20, -12, 40, 24, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "hsl(220, 15%, 25%)";
      ctx.fillRect(-18, -15, 8, 4); ctx.fillRect(10, -15, 8, 4);
      ctx.fillRect(-18, 11, 8, 4); ctx.fillRect(10, 11, 8, 4);
      ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(12, -4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "hsl(220, 15%, 40%)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-12, -20); ctx.stroke();
      ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(-12, -20, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      if (s.speechBubble) {
        ctx.save();
        const bx = s.carX + 30, by = s.carY - 35;
        ctx.font = "11px 'Space Grotesk'";
        const tw = ctx.measureText(s.speechBubble).width;
        ctx.fillStyle = "hsl(220, 18%, 12%)"; ctx.strokeStyle = c; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx - 6, by - 14, tw + 12, 22, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "hsl(180, 10%, 90%)"; ctx.fillText(s.speechBubble, bx, by);
        ctx.restore();
      }

      ctx.save();
      ctx.font = "bold 11px 'Space Grotesk'"; ctx.fillStyle = c; ctx.textAlign = "center";
      ctx.fillText(`${STATE_EMOJIS[s.state]} ${s.state}`, s.carX, s.carY + 28);
      ctx.restore();

      time++;
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Movement
  useEffect(() => {
    const interval = setInterval(() => {
      setSim(prev => {
        let { carX, carY, carAngle, state, personDetected, personX, personY } = prev;
        if (state === "ROAM" || state === "GREETING" || state === "CURIOUS") {
          carAngle += (Math.random() - 0.5) * 0.1;
          carX += Math.cos(carAngle) * 1.5; carY += Math.sin(carAngle) * 1.5;
        } else if (state === "AVOID") {
          const a = Math.atan2(carY - personY, carX - personX);
          carAngle = a;
          carX += Math.cos(a) * 2; carY += Math.sin(a) * 2;
        } else if (state === "PANIC") {
          carAngle += 0.15; carX += Math.cos(carAngle) * 3; carY += Math.sin(carAngle) * 3;
        } else if (state === "DANCE") {
          carAngle += 0.3;
        } else if (state === "FLATTERED") {
          carAngle += 0.05;
        }
        const margin = 30, maxX = 470, maxY = 270;
        if (carX <= margin) { carX = margin + 1; carAngle = Math.PI - carAngle; }
        if (carX >= maxX) { carX = maxX - 1; carAngle = Math.PI - carAngle; }
        if (carY <= margin) { carY = margin + 1; carAngle = -carAngle; }
        if (carY >= maxY) { carY = maxY - 1; carAngle = -carAngle; }
        return { ...prev, carX, carY, carAngle, personDetected, personX, personY };
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg border border-border overflow-hidden box-glow-cyan">
        <canvas ref={canvasRef} width={500} height={300} className="w-full" />
        <div className="absolute top-2 left-2 bg-card/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-muted-foreground">
          LIVE SIMULATION
        </div>
        {cameraOn && (
          <div className="absolute top-2 right-2 rounded border border-primary/60 overflow-hidden bg-black" style={{ width: 96, height: 72 }}>
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-card/80 px-1 text-[9px] font-mono text-primary">
              MOTION {(sim.motionLevel * 100).toFixed(0)}%
            </div>
          </div>
        )}
        <canvas ref={motionCanvasRef} width={64} height={48} className="hidden" />
      </div>

      {/* Sensor controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCameraOn(v => !v)}
          className={`px-3 py-2 rounded-md border font-mono text-xs transition-all ${cameraOn ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}
        >
          📷 CAMERA {cameraOn ? "● LIVE" : "○ OFF"}
        </button>
        <button
          onClick={() => setMicOn(v => !v)}
          className={`px-3 py-2 rounded-md border font-mono text-xs transition-all ${micOn ? "border-destructive bg-destructive/10 text-destructive animate-pulse" : "border-border bg-card text-muted-foreground"}`}
        >
          🎙️ MIC {micOn ? "● LISTENING" : "○ OFF"}
        </button>
      </div>

      {/* Live transcript / text input */}
      <div className="bg-card rounded-lg border border-border p-3 space-y-2">
        <div className="text-[10px] font-mono text-muted-foreground">LIVE TRANSCRIPT / TYPE A COMMAND</div>
        <div className="text-sm font-mono text-primary min-h-[20px]">{transcript || <span className="text-muted-foreground italic">say "hello", "you're cool", "stop", "dance"...</span>}</div>
        <form onSubmit={(e) => { e.preventDefault(); handleTextCommand(textInput); setTextInput(""); }} className="flex gap-2">
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="type a command..."
            className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
          />
          <button type="submit" className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-mono">SEND</button>
        </form>
      </div>

      {/* State buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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

      {/* Personality stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "EGO", value: sim.personality.ego, color: "hsl(var(--neon-pink))" },
          { label: "FEAR", value: sim.personality.fear.toFixed(1), color: "hsl(var(--neon-orange))" },
          { label: "PATIENCE", value: sim.personality.patience, color: "hsl(var(--neon-cyan))" },
          { label: "HAPPY", value: sim.personality.happiness.toFixed(1), color: "hsl(var(--neon-green))" },
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
