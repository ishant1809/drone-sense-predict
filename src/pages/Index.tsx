import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radar, Cpu, Shield, Zap } from "lucide-react";
import HeroBackground3D from "@/components/HeroBackground3D";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <HeroBackground3D />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-12 h-12 text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)]" />
          </motion.div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radar className="w-5 h-5 text-primary/50" />
            <span className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase font-bold">Drone Intelligence Platform</span>
            <Radar className="w-5 h-5 text-primary/50" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-[0.15em] text-primary mb-4 drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
            AEGIS EYE
          </h1>
          <p className="text-muted-foreground text-sm md:text-base tracking-[0.2em] uppercase">
            AI-Powered Surveillance & Disaster Prediction
          </p>
          <div className="mt-6 h-px w-64 mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
          {[
            {
              icon: Cpu,
              title: "SIMULATION",
              desc: "Run AI models on synthetic data. Test human detection, landslide analysis, and flood prediction modules.",
              route: "/simulation",
              delay: 0.3,
              direction: -40,
            },
            {
              icon: Zap,
              title: "PROTOTYPE",
              desc: "Connect to live drone hardware. Real-time feeds, sensor data, and operational deployment controls.",
              route: "/prototype",
              delay: 0.5,
              direction: 40,
            },
          ].map((card) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, x: card.direction }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: card.delay }}
              onClick={() => navigate(card.route)}
              className="group relative backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-8 text-left cursor-pointer hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.1)] transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center mb-5 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all">
                  <card.icon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2 tracking-[0.15em]">
                  {card.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.desc}
                </p>
                <div className="mt-5 flex items-center gap-2 text-primary text-xs tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Enter Module</span>
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase">
            Hackathon 2026 · Aegis Eye v1.0
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
