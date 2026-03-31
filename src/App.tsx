import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Simulation from "./pages/Simulation.tsx";
import Prototype from "./pages/Prototype.tsx";
import ModulePlaceholder from "./pages/ModulePlaceholder.tsx";
import LandslidePrediction from "./pages/LandslidePrediction.tsx";
import FloodPrediction from "./pages/FloodPrediction.tsx";
import HumanDetection from "./pages/HumanDetection.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/simulation/landslide-prediction" element={<LandslidePrediction />} />
          <Route path="/simulation/flood-prediction" element={<FloodPrediction />} />
          <Route path="/simulation/human-detection" element={<HumanDetection />} />
          <Route path="/simulation/:module" element={<ModulePlaceholder />} />
          <Route path="/prototype" element={<Prototype />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
