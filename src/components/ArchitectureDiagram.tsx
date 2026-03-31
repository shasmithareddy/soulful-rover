import { motion } from "framer-motion";

const architecture = [
  { label: "Camera", icon: "📷", output: "Frame", color: "hsl(var(--neon-cyan))" },
  { label: "YOLOv5n", icon: "👁️", output: "Person Data", color: "hsl(var(--neon-green))" },
  { label: "Mic", icon: "🎙️", output: "Audio", color: "hsl(var(--neon-purple))" },
  { label: "Vosk STT", icon: "🗣️", output: "Text", color: "hsl(var(--neon-pink))" },
  { label: "Intent NLP", icon: "🧠", output: "Mood", color: "hsl(var(--neon-orange))" },
  { label: "State Machine", icon: "⚙️", output: "State", color: "hsl(var(--neon-yellow))" },
  { label: "Personality", icon: "🎭", output: "Bias", color: "hsl(var(--neon-pink))" },
  { label: "Motor", icon: "🚘", output: "Movement", color: "hsl(var(--neon-cyan))" },
];

const ArchitectureDiagram = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {architecture.map((node, i) => (
        <div key={node.label} className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-lg px-3 py-2 text-center min-w-[80px]"
            style={{ borderColor: node.color }}
          >
            <div className="text-lg">{node.icon}</div>
            <div className="text-[10px] font-mono font-bold" style={{ color: node.color }}>{node.label}</div>
            <div className="text-[9px] text-muted-foreground">{node.output}</div>
          </motion.div>
          {i < architecture.length - 1 && (
            <span className="text-primary font-mono text-sm">→</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArchitectureDiagram;
