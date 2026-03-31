import { motion } from "framer-motion";

const states = [
  { id: "ROAM", emoji: "🟢", label: "Roam", desc: "Random exploration", color: "hsl(var(--neon-green))" },
  { id: "AVOID", emoji: "🟡", label: "Avoid", desc: "Move away from person", color: "hsl(var(--neon-yellow))" },
  { id: "PANIC", emoji: "🔴", label: "Panic", desc: "Too close / aggressive voice", color: "hsl(var(--destructive))" },
  { id: "FLATTERED", emoji: "💖", label: "Flattered", desc: "Compliment received", color: "hsl(var(--neon-pink))" },
  { id: "COMFORT", emoji: "🤗", label: "Comfort", desc: "Sadness detected", color: "hsl(var(--neon-cyan))" },
  { id: "ANNOYED", emoji: "😤", label: "Annoyed", desc: "Repeated disturbance", color: "hsl(var(--neon-orange))" },
  { id: "COOLDOWN", emoji: "⏳", label: "Cooldown", desc: "Prevents re-triggering", color: "hsl(var(--muted-foreground))" },
];

const transitions = [
  { from: "ROAM", to: "AVOID", label: "Person detected" },
  { from: "AVOID", to: "PANIC", label: "Too close" },
  { from: "ROAM", to: "FLATTERED", label: "Compliment" },
  { from: "ROAM", to: "COMFORT", label: "Sad speech" },
  { from: "PANIC", to: "COOLDOWN", label: "Timeout" },
  { from: "FLATTERED", to: "COOLDOWN", label: "Timeout" },
  { from: "COMFORT", to: "COOLDOWN", label: "Timeout" },
  { from: "ANNOYED", to: "COOLDOWN", label: "Timeout" },
  { from: "COOLDOWN", to: "ROAM", label: "Reset" },
];

const StateVisualization = () => {
  return (
    <div className="space-y-6">
      {/* States grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {states.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-lg p-3 text-center hover:scale-105 transition-transform"
            style={{ borderColor: s.color }}
          >
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-xs font-bold font-mono" style={{ color: s.color }}>{s.label}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Transitions */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-sm font-mono text-primary mb-3">TRANSITIONS</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {transitions.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-neon-cyan">{t.from}</span>
              <span className="text-primary">→</span>
              <span className="text-neon-purple">{t.to}</span>
              <span className="text-foreground/40">({t.label})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateVisualization;
