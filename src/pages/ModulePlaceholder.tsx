import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

const titles: Record<string, string> = {
  "crowd-monitoring": "CROWD MONITORING",
  "human-detection": "HUMAN DETECTION",
  "landslide-prediction": "LANDSLIDE PREDICTION",
  "flood-prediction": "FLOOD PREDICTION",
};

const ModulePlaceholder = () => {
  const navigate = useNavigate();
  const { module } = useParams();
  const title = titles[module || ""] || "MODULE";

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => navigate("/simulation")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-body text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Simulation
          </button>

          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider text-glow text-primary mb-2">
            {title}
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mb-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center border-glow"
        >
          <Construction className="w-12 h-12 text-primary animate-pulse-glow mb-6" />
          <h2 className="text-xl font-display font-semibold text-foreground tracking-wide mb-3">
            UNDER DEVELOPMENT
          </h2>
          <p className="text-muted-foreground text-sm font-body max-w-md">
            This module is being built. Check back soon for AI-powered analysis capabilities.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
