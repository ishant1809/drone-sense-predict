import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import {
  ArrowLeft, Waves, Droplets, MapPin, Activity, Database, Ruler, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import DatasetPreview from "@/components/DatasetPreview";
import HeroBackground3D from "@/components/HeroBackground3D";

interface ZoneManifest { id: string; name: string; folder: string; }
interface FloodRow {
  lat: number; long: number; elevation: number; distance_from_river?: number;
  rain_day_1: number; rain_day_2: number; rain_day_3: number; rain_day_4: number;
  rain_day_5: number; rain_day_6: number; rain_day_7: number;
  river_level_day_1: number; river_level_day_2: number; river_level_day_3: number;
  river_level_day_4: number; river_level_day_5: number; river_level_day_6: number;
  river_level_day_7: number; river_trend?: string; soil_moisture: number;
  water_spread_trend?: number; flood_next_day?: number; flood_probability?: number;
}

const floodLabel = (row: FloodRow) => {
  const p = row.flood_probability ?? (row.flood_next_day === 1 ? 0.95 : 0.05);
  if (p > 0.75) return "Critical Risk";
  if (p > 0.45) return "Moderate Risk";
  return "Stable";
};
const floodColor = (row: FloodRow) => {
  const p = row.flood_probability ?? (row.flood_next_day === 1 ? 0.95 : 0.05);
  if (p > 0.75) return "hsl(0, 85%, 55%)";
  if (p > 0.45) return "hsl(35, 90%, 55%)";
  return "hsl(150, 70%, 45%)";
};

const FloodPrediction = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneManifest[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneManifest | null>(null);
  const [data, setData] = useState<FloodRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/flood/manifest.json").then((r) => r.json()).then(setZones).catch(console.error);
  }, []);

  const loadZone = async (zone: ZoneManifest) => {
    setLoading(true);
    try {
      const [csvRes, imgRes] = await Promise.all([
        fetch(`/data/flood/${zone.folder}/predictions.csv`),
        fetch(`/data/flood/${zone.folder}/image-manifest.json`).catch(() => null),
      ]);
      if (csvRes.ok) {
        const text = await csvRes.text();
        const parsed = Papa.parse<FloodRow>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
        setData(parsed.data.filter((r) => r.lat != null && r.long != null && (r.flood_probability != null || r.flood_next_day != null)));
      }
      if (imgRes && imgRes.ok) setPreviewImages(await imgRes.json());
      else setPreviewImages([]);
      setSelectedZone(zone);
    } catch (e) { console.error("Failed to load flood zone", e); }
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!data.length) return null;
    const avg = (key: keyof FloodRow) => data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length;
    const hasProb = data[0].flood_probability !== undefined;
    const avgRisk = hasProb ? data.reduce((s, r) => s + (r.flood_probability || 0), 0) / data.length : data.filter(r => r.flood_next_day === 1).length / data.length;
    return { avgElevation: avg("elevation"), avgRiverDist: avg("distance_from_river"), avgSoilMoisture: avg("soil_moisture") < 1 ? avg("soil_moisture") * 100 : avg("soil_moisture"), avgWaterSpread: avg("water_spread_trend"), avgRisk, sampleCount: data.length };
  }, [data]);

  const rainfallData = useMemo(() => {
    if (!data.length) return [];
    const avg = (key: keyof FloodRow) => data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length;
    return [
      { day: "D-6", rainfall: avg("rain_day_1") }, { day: "D-5", rainfall: avg("rain_day_2") },
      { day: "D-4", rainfall: avg("rain_day_3") }, { day: "D-3", rainfall: avg("rain_day_4") },
      { day: "D-2", rainfall: avg("rain_day_5") }, { day: "D-1", rainfall: avg("rain_day_6") },
      { day: "Today", rainfall: avg("rain_day_7") },
    ];
  }, [data]);

  const mapCenter = useMemo((): [number, number] => {
    if (!data.length) return [23.45, 87.12];
    return [data.reduce((s, r) => s + r.lat, 0) / data.length, data.reduce((s, r) => s + r.long, 0) / data.length];
  }, [data]);

  if (!selectedZone) {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <HeroBackground3D />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/simulation")} className="mb-4 text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
                <Waves className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-[0.1em] uppercase">Flood Prediction</h1>
                <p className="text-xs text-muted-foreground tracking-wide">Hydrological risk analysis</p>
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone, i) => (
              <motion.div key={zone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="cursor-pointer backdrop-blur-xl bg-card/30 border-border/50 hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)] transition-all duration-500 group" onClick={() => loadZone(zone)}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)] transition-all">
                        <Database className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg tracking-tight">{zone.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Telemetric Dataset</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Analyze real-time sensors and flood vulnerability.</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <HeroBackground3D />
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" onClick={() => { setSelectedZone(null); setData([]); setPreviewImages([]); }} className="mb-3 text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Datasets
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <Waves className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-[0.1em]">{selectedZone.name} <span className="text-primary/50">DATASTREAM</span></h1>
            {stats && (
              <span className="ml-auto px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest border uppercase backdrop-blur-sm" style={{ backgroundColor: stats.avgRisk > 0.5 ? "hsl(0,85%,55%)22" : "hsl(150,70%,45%)22", color: stats.avgRisk > 0.5 ? "hsl(0,85%,55%)" : "hsl(150,70%,45%)", borderColor: stats.avgRisk > 0.5 ? "hsl(0,85%,55%)44" : "hsl(150,70%,45%)44" }}>
                Risk Index: {(stats.avgRisk * 100).toFixed(1)}%
              </span>
            )}
            {previewImages.length > 0 && (
              <DatasetPreview basePath={`/data/flood/${selectedZone.folder}/images`} images={previewImages} title={`${selectedZone.name} — Sensor Imagery`} />
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
              <div className="animate-pulse text-primary tracking-[0.2em] text-sm uppercase">Synchronizing sensors...</div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { icon: TrendingUp, label: "Flood Chance", value: `${(stats.avgRisk * 100).toFixed(1)}%`, color: stats.avgRisk > 0.5 ? "hsl(0, 85%, 55%)" : "hsl(var(--primary))" },
                    { icon: Ruler, label: "Avg Elevation", value: `${stats.avgElevation.toFixed(0)}m`, color: "hsl(var(--primary))" },
                    { icon: Waves, label: "River Dist", value: stats.avgRiverDist ? `${stats.avgRiverDist.toFixed(1)} km` : "N/A", color: "hsl(var(--primary))" },
                    { icon: Droplets, label: "Soil Moisture", value: `${stats.avgSoilMoisture.toFixed(0)}%`, color: "hsl(var(--primary))" },
                    { icon: Activity, label: "Spread Index", value: stats.avgWaterSpread ? stats.avgWaterSpread.toFixed(1) : "STABLE", color: "hsl(35, 90%, 55%)" },
                    { icon: MapPin, label: "GPS Center", value: `${mapCenter[0].toFixed(2)}, ${mapCenter[1].toFixed(2)}`, color: "hsl(var(--primary))" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="backdrop-blur-xl bg-card/30 border-border/50 shadow-lg">
                        <CardContent className="p-4 text-center">
                          <stat.icon className="h-5 w-5 mx-auto mb-2 opacity-80" style={{ color: stat.color }} />
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-wider">{stat.label}</p>
                          <p className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="backdrop-blur-xl bg-card/30 border-border/50 overflow-hidden shadow-2xl">
                  <header className="px-6 pt-6 pb-2">
                    <CardTitle className="text-xs tracking-[0.15em] text-primary flex items-center gap-2 uppercase">
                      <MapPin className="h-4 w-4" /> Terrain Telemetry Scan
                    </CardTitle>
                  </header>
                  <CardContent className="p-0">
                    <div className="h-[350px] w-full relative">
                      <iframe key={`${mapCenter[0]}-${mapCenter[1]}`} title="Zone Map" width="100%" height="100%" style={{ border: 0 }} src={`https://maps.google.com/maps?q=${mapCenter[0]},${mapCenter[1]}&t=k&z=14&output=embed`} loading="lazy" allowFullScreen />
                      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/30 text-[10px] font-mono text-muted-foreground">
                        POINT: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-card/30 border-border/50 shadow-2xl">
                  <header className="px-6 pt-6 pb-0">
                    <CardTitle className="text-xs tracking-[0.15em] text-primary flex items-center gap-2 uppercase">
                      <Droplets className="h-4 w-4" /> Weekly Precipitation Analysis (mm)
                    </CardTitle>
                  </header>
                  <CardContent>
                    <div className="h-[300px] pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rainfallData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: "12px" }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value: number) => [`${value.toFixed(1)} mm`, "Rainfall"]} />
                          <Bar dataKey="rainfall" radius={[2, 2, 0, 0]} barSize={24}>
                            {rainfallData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.rainfall > 60 ? "hsl(0, 85%, 55%)" : entry.rainfall > 30 ? "hsl(35, 90%, 55%)" : "hsl(var(--primary))"} fillOpacity={0.8} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="backdrop-blur-xl bg-card/30 border-border/50 shadow-2xl">
                <header className="px-6 pt-6 pb-2">
                  <CardTitle className="text-xs tracking-[0.15em] text-primary flex items-center gap-2 uppercase">
                    <Database className="h-4 w-4" /> Sensor Stream ({data.length} Nodes)
                  </CardTitle>
                </header>
                <CardContent>
                  <div className="max-h-[400px] overflow-auto rounded-xl border border-border/30 bg-background/30 backdrop-blur-sm">
                    <Table>
                      <TableHeader className="bg-secondary/30 sticky top-0 z-10 backdrop-blur-md">
                        <TableRow className="border-border/30">
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest">Geolocation</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Elevation</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Moisture</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Rain (24h)</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Risk Analysis</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, i) => (
                          <TableRow key={i} className="border-border/20 hover:bg-primary/5 transition-colors">
                            <TableCell className="text-[11px] font-mono text-muted-foreground">{row.lat.toFixed(4)} / {row.long.toFixed(4)}</TableCell>
                            <TableCell className="text-xs text-center font-mono">{row.elevation}m</TableCell>
                            <TableCell className="text-xs text-center font-mono">{row.soil_moisture < 1 ? (row.soil_moisture * 100).toFixed(0) : row.soil_moisture}%</TableCell>
                            <TableCell className="text-xs text-center font-mono">{row.rain_day_7.toFixed(1)}mm</TableCell>
                            <TableCell className="text-center">
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: floodColor(row) + "22", color: floodColor(row) }}>
                                {floodLabel(row)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloodPrediction;
