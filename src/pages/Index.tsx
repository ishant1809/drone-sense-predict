import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radar, Cpu, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary animate-pulse-glow" />
            <Radar className="w-8 h-8 text-primary/70" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider text-glow text-primary mb-4">
            AEGIS EYE
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-body tracking-widest uppercase">
            AI-Powered Drone Surveillance & Disaster Prediction
          </p>
          <div className="mt-4 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
          <motion.button
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => navigate("/simulation")}
            className="group relative bg-card border border-border rounded-lg p-8 text-left card-hover-glow cursor-pointer"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                <Cpu className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-2 tracking-wide">
                SIMULATION
              </h2>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">
                Run AI models on live field data. Test human detection, landslide analysis, and flood prediction modules.
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary text-xs font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Enter Module</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={() => navigate("/prototype")}
            className="group relative bg-card border border-border rounded-lg p-8 text-left card-hover-glow cursor-pointer"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-2 tracking-wide">
                PROTOTYPE
              </h2>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">
                Connect to live drone hardware. Real-time feeds, sensor data, and operational deployment controls.
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary text-xs font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Enter Module</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground/50 text-xs font-body tracking-widest uppercase">
            Hackathon 2026 · Drone Intelligence Platform
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
