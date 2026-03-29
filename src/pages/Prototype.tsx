import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio } from "lucide-react";

const Prototype = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-body text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider text-glow text-primary mb-2">
            PROTOTYPE MODE
          </h1>
          <p className="text-muted-foreground text-sm font-body tracking-wide mb-10">
            Hardware integration & live drone control
          </p>
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mb-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center border-glow"
        >
          <Radio className="w-12 h-12 text-primary animate-pulse-glow mb-6" />
          <h2 className="text-xl font-display font-semibold text-foreground tracking-wide mb-3">
            AWAITING HARDWARE
          </h2>
          <p className="text-muted-foreground text-sm font-body max-w-md">
            Connect your drone hardware to begin live prototype operations. This module will host real-time telemetry, camera feeds, and control interfaces.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Prototype;
