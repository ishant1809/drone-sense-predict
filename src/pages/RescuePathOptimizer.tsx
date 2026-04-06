import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, AlertTriangle, LocateFixed, Zap, Shield, Clock, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { findOptimizedPath, fetchRoadPaths, analyzePathSafety, getDistance } from "@/lib/pathfinding";
import HeroBackground3D from "@/components/HeroBackground3D";

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const startIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const endIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const MapClickHandler = ({ onClick }: { onClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`p-4 rounded-xl border backdrop-blur-xl bg-card/40 ${color}`}
  >
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-3.5 h-3.5 opacity-70" />
      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>
    </div>
    <p className="text-lg font-bold font-mono">{value}</p>
  </motion.div>
);

const RescuePathOptimizer = () => {
  const navigate = useNavigate();
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimizedPath, setOptimizedPath] = useState<[number, number][] | null>(null);
  const [pathStats, setPathStats] = useState<{ distance: string; time: string; safety: string } | null>(null);
  const [interactionMode, setInteractionMode] = useState<'points' | 'danger'>('points');
  const [riskZones, setRiskZones] = useState<{ id: number; center: [number, number]; radius: number; type: string; risk: number }[]>([]);

  const handleMapClick = (latlng: L.LatLng) => {
    if (interactionMode === 'danger') {
      setRiskZones(prev => [...prev, { id: Date.now(), center: [latlng.lat, latlng.lng] as [number, number], radius: 200, type: 'Hazard', risk: 0.9 }]);
      toast.info("Area marked as unsafe.");
      return;
    }
    if (!startPoint) setStartPoint([latlng.lat, latlng.lng]);
    else if (!endPoint) setEndPoint([latlng.lat, latlng.lng]);
    else { setStartPoint([latlng.lat, latlng.lng]); setEndPoint(null); setOptimizedPath(null); setPathStats(null); }
  };

  const handleCalculatePath = async () => {
    if (!startPoint || !endPoint) return toast.error("Set two points first");
    setIsCalculating(true); setOptimizedPath(null);
    try {
      const allRoads = await fetchRoadPaths(startPoint, endPoint);
      let path: [number, number][] | null = null;
      const directDist = getDistance({ lat: startPoint[0], lng: startPoint[1] }, { lat: endPoint[0], lng: endPoint[1] });

      if (allRoads && allRoads.length > 0) {
        path = [...allRoads[0]];
        const analysis = analyzePathSafety(path, riskZones);
        if (analysis.maxRisk > 0.01 || analysis.distance > (directDist * 2.5)) path = null;
      }

      if (!path) {
        const result = findOptimizedPath(startPoint, endPoint, riskZones);
        path = result.path;
      } else {
        if (getDistance({ lat: path[0][0], lng: path[0][1] }, { lat: startPoint[0], lng: startPoint[1] }) > 0.005) path.unshift(startPoint);
        if (getDistance({ lat: path[path.length - 1][0], lng: path[path.length - 1][1] }, { lat: endPoint[0], lng: endPoint[1] }) > 0.005) path.push(endPoint);
      }

      const { distance, safetyScore } = analyzePathSafety(path, riskZones);
      setOptimizedPath(path);
      setPathStats({ distance: `${distance.toFixed(2)} km`, time: `${Math.round(distance * 12 + 5)} min`, safety: `${Math.round(safetyScore)}%` });
      toast.success("Mission route computed.");
    } catch { toast.error("Planning failed."); } finally { setIsCalculating(false); }
  };

  const resetAll = () => { setStartPoint(null); setEndPoint(null); setOptimizedPath(null); setPathStats(null); setRiskZones([]); };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <HeroBackground3D />

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => navigate("/simulation")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
            <h1 className="text-lg md:text-xl font-bold tracking-[0.25em] text-primary uppercase">
              Rescue Optimizer
            </h1>
          </div>

          <div className="flex backdrop-blur-md bg-card/30 border border-border rounded-lg p-1 gap-1">
            <Button
              variant={interactionMode === 'points' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInteractionMode('points')}
              className="text-[10px] gap-1"
            >
              <LocateFixed className="w-3 h-3" /> POINTS
            </Button>
            <Button
              variant={interactionMode === 'danger' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => setInteractionMode('danger')}
              className="text-[10px] gap-1"
            >
              <AlertTriangle className="w-3 h-3" /> DANGER
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* Mission Briefing */}
            <Card className="backdrop-blur-xl bg-card/30 border-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.05)]">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Mission Briefing</span>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Road-Snapped Routing", desc: "Follows real-world mountain trails and roads.", icon: Navigation },
                    { title: "Zero-Tolerance Bypass", desc: "Ignores compromised roads for safe off-road detours.", icon: AlertTriangle },
                    { title: "Hybrid Final Mile", desc: "AI path-snapping for off-grid coordinates.", icon: Zap },
                  ].map((p) => (
                    <div key={p.title} className="flex gap-3 group">
                      <div className="p-2 rounded-lg bg-secondary/50 border border-border group-hover:border-primary/30 transition-colors">
                        <p.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground leading-none mb-1 uppercase tracking-tight">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coordinates */}
            <Card className="backdrop-blur-xl bg-card/30 border-border/50">
              <CardContent className="pt-5 space-y-3">
                <motion.div
                  className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden"
                  animate={startPoint ? { borderColor: 'hsl(217 91% 60% / 0.4)' } : {}}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-r" />
                  <span className="text-[9px] font-bold text-blue-400 block mb-1.5 uppercase tracking-[0.15em] pl-2">I. Deployment Base</span>
                  <p className="text-[11px] font-mono text-muted-foreground pl-2">
                    {startPoint ? `${startPoint[0].toFixed(5)}, ${startPoint[1].toFixed(5)}` : "Click map to set"}
                  </p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 relative overflow-hidden"
                  animate={endPoint ? { borderColor: 'hsl(0 84% 60% / 0.4)' } : {}}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-r" />
                  <span className="text-[9px] font-bold text-red-400 block mb-1.5 uppercase tracking-[0.15em] pl-2">II. Extraction Target</span>
                  <p className="text-[11px] font-mono text-muted-foreground pl-2">
                    {endPoint ? `${endPoint[0].toFixed(5)}, ${endPoint[1].toFixed(5)}` : "Awaiting signal"}
                  </p>
                  {!endPoint && (
                    <div className="absolute top-2 right-2 animate-pulse opacity-10">
                      <LocateFixed className="h-8 w-8 text-red-500" />
                    </div>
                  )}
                </motion.div>

                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 h-12 text-xs tracking-[0.15em] font-bold uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all"
                    onClick={handleCalculatePath}
                    disabled={isCalculating || !startPoint || !endPoint}
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Computing...
                      </span>
                    ) : "Execute Mission"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all"
                    onClick={resetAll}
                  >
                    <Zap className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Telemetry */}
            <AnimatePresence>
              {pathStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#4ade80]" />
                    <span className="text-[9px] font-bold tracking-[0.2em] text-green-400 uppercase">Telemetry Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <StatCard icon={Ruler} label="Distance" value={pathStats.distance} color="border-primary/20 text-primary" />
                    <StatCard icon={Clock} label="ETA" value={pathStats.time} color="border-amber-500/20 text-amber-400" />
                    <StatCard icon={Shield} label="Safety" value={pathStats.safety} color="border-green-500/20 text-green-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 h-[700px] relative rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Glow border effect */}
            <div className="absolute inset-0 rounded-2xl border border-primary/10 z-10 pointer-events-none shadow-[inset_0_0_30px_hsl(var(--primary)/0.03)]" />

            <MapContainer center={[30.0757, 78.5206]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <LayersControl position="topright" collapsed={false}>
                <LayersControl.BaseLayer checked name="SATEL">
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="TERRAIN">
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
                </LayersControl.BaseLayer>
              </LayersControl>
              <MapClickHandler onClick={handleMapClick} />
              {riskZones.map(z => (
                <Circle
                  key={z.id}
                  center={z.center}
                  radius={z.radius}
                  pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.3, color: '#ef4444', weight: 2, dashArray: '6,4' }}
                />
              ))}
              {startPoint && <Marker position={startPoint} icon={startIcon} />}
              {endPoint && <Marker position={endPoint} icon={endIcon} />}
              {optimizedPath && (
                <Polyline
                  positions={optimizedPath}
                  pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.9, dashArray: '10, 8' }}
                />
              )}
            </MapContainer>

            {/* Mode indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
              <motion.span
                key={interactionMode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-5 py-2 rounded-full border backdrop-blur-md font-bold text-[10px] tracking-widest ${
                  interactionMode === 'danger'
                    ? 'bg-destructive/80 border-destructive text-destructive-foreground animate-pulse'
                    : 'bg-card/60 border-primary/20 text-primary'
                }`}
              >
                {interactionMode === 'danger' ? "⚠ THREAT MODE" : "◉ MISSION PLANNING"}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RescuePathOptimizer;
