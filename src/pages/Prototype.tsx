import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Wifi, Signal, Monitor } from "lucide-react";
import HeroBackground3D from "@/components/HeroBackground3D";

const Prototype = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <HeroBackground3D />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-bold">Hardware Module</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.15em] text-primary mb-2 drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            PROTOTYPE MODE
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide mb-10">
            Hardware integration & live drone control
          </p>
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mb-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-primary/20 transition-all duration-500 shadow-2xl"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative p-6 rounded-full bg-secondary/50 border border-border/30">
              <Radio className="w-12 h-12 text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground tracking-[0.15em] mb-3">
            AWAITING HARDWARE
          </h2>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            Connect your drone hardware to begin live prototype operations. This module will host real-time telemetry, camera feeds, and control interfaces.
          </p>

          <div className="flex items-center gap-6 mt-8 text-muted-foreground/40">
            {[Wifi, Signal, Monitor].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Prototype;
