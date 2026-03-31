import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModuleCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  code: string;
  description: string;
  children?: ReactNode;
  index: number;
}

const ModuleCard = ({ icon, title, subtitle, color, code, description, children, index }: ModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/30 transition-colors"
    >
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold font-display" style={{ color }}>{title}</h3>
            <p className="text-xs font-mono text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed mt-2">{description}</p>
      </div>

      {/* Code block */}
      <div className="bg-background/50 p-4 overflow-x-auto">
        <pre className="text-xs font-mono text-muted-foreground leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      {/* Optional extra content */}
      {children && (
        <div className="p-4 border-t border-border">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default ModuleCard;
