import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, AlertTriangle, LocateFixed, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { findOptimizedPath, fetchRoadPaths, analyzePathSafety, getDistance } from "@/lib/pathfinding";

// Icons
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

const RescuePathOptimizer = () => {
  const navigate = useNavigate();
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimizedPath, setOptimizedPath] = useState<[number, number][] | null>(null);
  const [pathStats, setPathStats] = useState<{distance: string, time: string, safety: string} | null>(null);
  const [interactionMode, setInteractionMode] = useState<'points' | 'danger'>('points');
  const [riskZones, setRiskZones] = useState<{ id: number, center: [number, number], radius: number, type: string, risk: number }[]>([]);

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
      let mode = "OSRM (Road access)";

      const directDist = getDistance({lat:startPoint[0], lng:startPoint[1]}, {lat:endPoint[0], lng:endPoint[1]});

      if (allRoads && allRoads.length > 0) {
        path = [...allRoads[0]];
        const analysis = analyzePathSafety(path, riskZones);
        
        // ZERO TOLERANCE: Any risk detected triggers AI Bypass
        if (analysis.maxRisk > 0.01 || analysis.distance > (directDist * 2.5)) {
           path = null; 
        }
      }

      if (!path) {
        mode = "AI Safe Bypass";
        const result = findOptimizedPath(startPoint, endPoint, riskZones);
        path = result.path;
      } else {
        // Snapping logic
        if (getDistance({lat:path[0][0], lng:path[0][1]}, {lat:startPoint[0], lng:startPoint[1]}) > 0.005) path.unshift(startPoint);
        if (getDistance({lat:path[path.length-1][0], lng:path[path.length-1][1]}, {lat:endPoint[0], lng:endPoint[1]}) > 0.005) path.push(endPoint);
      }

      const { distance, safetyScore } = analyzePathSafety(path, riskZones);
      setOptimizedPath(path);
      setPathStats({ distance: `${distance.toFixed(2)} km`, time: `${Math.round(distance * 12 + 5)} min`, safety: `${Math.round(safetyScore)}% (Safe Extraction)` });
      toast.success("Ready for mission.");
    } catch { toast.error("Planning failed."); } finally { setIsCalculating(false); }
  };

  const resetAll = () => { setStartPoint(null); setEndPoint(null); setOptimizedPath(null); setPathStats(null); setRiskZones([]); };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => navigate("/simulation")}><ArrowLeft className="mr-2 h-4" /> BACK</Button>
            <h1 className="text-xl font-bold font-orbitron tracking-widest text-primary flex items-center gap-2 uppercase"><Navigation className="h-6 w-6" /> RESCUE OPTIMIZER</h1>
            <div className="flex bg-neutral-900 rounded p-1 gap-1">
                <Button variant={interactionMode==='points'?'default':'ghost'} size="sm" onClick={()=>setInteractionMode('points')} className="text-[10px]"><LocateFixed className="w-3 h-3 mr-1" /> POINTS</Button>
                <Button variant={interactionMode==='danger'?'destructive':'ghost'} size="sm" onClick={()=>setInteractionMode('danger')} className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" /> DANGER</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            {/* Mission Briefing */}
            <Card className="bg-neutral-900/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold font-orbitron tracking-widest text-primary uppercase">Mission Briefing</span>
                </div>
                <div className="space-y-4">
                   {[
                     { 
                       title: "Road-Snapped Routing", 
                       desc: "Follows real-world mountain trails and roads for navigation.", 
                       icon: Navigation 
                     },
                     { 
                       title: "Zero-Tolerance Bypass", 
                       desc: "Instantly ignores compromised roads to calculate safe off-road detours.", 
                       icon: AlertTriangle 
                     },
                     { 
                       title: "Hybrid Final Mile", 
                       desc: "Bridges the gap to off-grid coordinates using AI path-snapping.", 
                       icon: Zap 
                     }
                   ].map((p) => (
                     <div key={p.title} className="flex gap-3">
                        <div className="p-1.5 rounded-md bg-neutral-900 border border-neutral-800">
                           <p.icon className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold text-white leading-none mb-1 uppercase tracking-tight">{p.title}</p>
                           <p className="text-[10px] text-neutral-500 leading-tight">{p.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-950 border-neutral-900">
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                  <span className="text-[10px] font-bold text-blue-400 block mb-1 uppercase tracking-tighter">I. DEPLOYMENT BASE </span>
                  <p className="text-[11px] font-mono opacity-50">{startPoint ? `${startPoint[0].toFixed(5)}, ${startPoint[1].toFixed(5)}` : "Set coordinates on map"}</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded relative overflow-hidden">
                  <span className="text-[10px] font-bold text-red-400 block mb-1 uppercase tracking-tighter">II. EXTRACTION TARGET</span>
                  <p className="text-[11px] font-mono opacity-50">{endPoint ? `${endPoint[0].toFixed(5)}, ${endPoint[1].toFixed(5)}` : "Awaiting signal"}</p>
                  <div className="absolute top-0 right-0 p-2 animate-pulse opacity-20"><LocateFixed className="h-10 w-10 text-red-500" /></div>
                </div>
                <div className="flex gap-2">
                    <Button className="flex-1 font-orbitron h-14 text-sm tracking-widest bg-primary hover:bg-cyan-400 text-black shadow-lg shadow-primary/10 transition-all font-black uppercase" onClick={handleCalculatePath} disabled={isCalculating || !startPoint || !endPoint}>
                        {isCalculating ? "COMPUTING..." : "EXECUTE MISSION PLAN"}
                    </Button>
                    <Button variant="outline" className="h-14 border-red-500/30 hover:bg-red-500/10" onClick={resetAll}><Zap className="w-4 h-4 text-red-400" /></Button>
                </div>
              </CardContent>
            </Card>

            {pathStats && (
              <Card className="bg-neutral-950 border-neutral-900 flex-1 border-l-4 border-l-green-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 h-16 w-16 bg-green-500/5 rotate-45 translate-x-8 -translate-y-8" />
                <CardHeader className="py-2 text-[10px] font-orbitron text-center border-b border-white/5 opacity-80">PLAN TELEMETRY (SNAPSHOT)</CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-[10px] text-neutral-500 uppercase font-black">Dist.</p><p className="text-sm font-bold font-mono text-white">{pathStats.distance}</p></div>
                  <div><p className="text-[10px] text-neutral-500 uppercase font-black">Time</p><p className="text-sm font-bold font-mono text-white">{pathStats.time}</p></div>
                  <div className="col-span-2 pt-2 border-t border-white/5 text-[10px] flex justify-between font-bold">
                    <span className="text-neutral-500 uppercase">THREAT LEVEL:</span><span className="text-green-400 uppercase tracking-widest">{pathStats.safety}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8 h-[750px] relative rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl group ring-1 ring-white/10">
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
              {riskZones.map(z => <Circle key={z.id} center={z.center} radius={z.radius} pathOptions={{ fillColor: 'red', fillOpacity: 0.35, color: '#ef4444', weight: 2, dashArray: '4,4' }} />)}
              {startPoint && <Marker position={startPoint} icon={startIcon} />}
              {endPoint && <Marker position={endPoint} icon={endIcon} />}
              {optimizedPath && <Polyline positions={optimizedPath} pathOptions={{ color: '#22d3ee', weight: 5, opacity: 0.9, dashArray: '10, 10' }} />}
            </MapContainer>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
              <span className={`px-6 py-2 rounded-full border shadow-2xl transition-all font-bold text-[11px] ${interactionMode === 'danger' ? 'bg-red-600/90 border-red-500 text-white animate-pulse' : 'bg-black/80 border-primary/20 text-primary'}`}>
                {interactionMode === 'danger' ? "THREAT DETECTION MODE" : "MISSION PLANNING LIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescuePathOptimizer;
