import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScanEye, Mountain, Waves, Navigation } from "lucide-react";
import HeroBackground3D from "@/components/HeroBackground3D";

const modules = [
  {
    title: "Human Detection",
    description: "Identify and track individuals in disaster zones, search-and-rescue operations, and restricted areas.",
    icon: ScanEye,
    route: "/simulation/human-detection",
    status: "Ready",
    accent: "from-cyan-500/10 to-blue-500/5",
  },
  {
    title: "Landslide Prediction",
    description: "Analyze terrain data, soil moisture, and slope gradients to predict landslide-prone areas.",
    icon: Mountain,
    route: "/simulation/landslide-prediction",
    status: "Ready",
    accent: "from-amber-500/10 to-orange-500/5",
  },
  {
    title: "Flood Prediction",
    description: "Monitor water levels, rainfall data, and river flow to forecast flood events in real-time.",
    icon: Waves,
    route: "/simulation/flood-prediction",
    status: "Ready",
    accent: "from-blue-500/10 to-indigo-500/5",
  },
  {
    title: "Rescue Path Optimizer",
    description: "Mission-ready navigation for extreme terrain with zero-tolerance AI safety bypass.",
    icon: Navigation,
    route: "/simulation/rescue-optimizer",
    status: "Ready",
    accent: "from-green-500/10 to-emerald-500/5",
  },
];

const Simulation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <HeroBackground3D />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-bold">AI Modules</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.15em] text-primary mb-2 drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            SIMULATION MODE
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide mb-10">
            Select a module to run AI-powered analysis on synthetic data
          </p>
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mb-10" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.button
              key={mod.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 * i }}
              onClick={() => navigate(mod.route)}
              className="group relative backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-6 text-left cursor-pointer hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)] transition-all duration-500"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mod.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)] transition-all">
                    <mod.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-primary/50 border border-primary/15 rounded-full px-3 py-1 backdrop-blur-sm">
                    {mod.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 tracking-[0.1em]">
                  {mod.title.toUpperCase()}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {mod.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Launch</span>
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Simulation;
