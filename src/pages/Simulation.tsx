import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScanEye, Mountain, Waves, Navigation } from "lucide-react";

const modules = [
  {
    title: "Human Detection",
    description: "Identify and track individuals in disaster zones, search-and-rescue operations, and restricted areas.",
    icon: ScanEye,
    route: "/simulation/human-detection",
    status: "Ready",
  },
  {
    title: "Landslide Prediction",
    description: "Analyze terrain data, soil moisture, and slope gradients to predict landslide-prone areas.",
    icon: Mountain,
    route: "/simulation/landslide-prediction",
    status: "Ready",
  },
  {
    title: "Flood Prediction",
    description: "Monitor water levels, rainfall data, and river flow to forecast flood events in real-time.",
    icon: Waves,
    route: "/simulation/flood-prediction",
    status: "Ready",
  },
  {
    title: "Rescue Path Optimizer",
    description: "Mission-ready navigation for extreme terrain. Combines real-world road data with zero-tolerance AI safety bypass for high-stakes extractions.",
    icon: Navigation,
    route: "/simulation/rescue-optimizer",
    status: "Ready",
  },
];

const Simulation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Back button & header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-body text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider text-glow text-primary mb-2">
            SIMULATION MODE
          </h1>
          <p className="text-muted-foreground text-sm font-body tracking-wide mb-10">
            Select a module to run AI-powered analysis on synthetic data
          </p>
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mb-10" />
        </motion.div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.button
              key={mod.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              onClick={() => navigate(mod.route)}
              className="group relative bg-card border border-border rounded-lg p-6 text-left card-hover-glow cursor-pointer"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <mod.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-display tracking-widest uppercase text-primary/60 border border-primary/20 rounded-full px-3 py-1">
                    {mod.status}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 tracking-wide">
                  {mod.title.toUpperCase()}
                </h3>
                <p className="text-muted-foreground text-sm font-body leading-relaxed">
                  {mod.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary text-xs font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Launch</span>
                  <span className="text-lg">→</span>
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
