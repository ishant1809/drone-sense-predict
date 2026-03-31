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

interface ZoneManifest {
  id: string;
  name: string;
  folder: string;
}

interface FloodRow {
  lat: number;
  long: number;
  elevation: number;
  distance_from_river: number;
  rain_day_1: number;
  rain_day_2: number;
  rain_day_3: number;
  rain_day_4: number;
  rain_day_5: number;
  rain_day_6: number;
  rain_day_7: number;
  river_level_day_1: number;
  river_level_day_2: number;
  river_level_day_3: number;
  river_level_day_4: number;
  river_level_day_5: number;
  river_level_day_6: number;
  river_level_day_7: number;
  river_trend: string;
  soil_moisture: number;
  water_spread_trend: number;
  flood_next_day: number;
}

const floodLabel = (v: number) => (v === 1 ? "Flood Likely" : "Safe");
const floodColor = (v: number) => (v === 1 ? "hsl(0, 85%, 55%)" : "hsl(150, 70%, 45%)");

const FloodPrediction = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneManifest[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneManifest | null>(null);
  const [data, setData] = useState<FloodRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/flood/manifest.json")
      .then((r) => r.json())
      .then(setZones)
      .catch(console.error);
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
        const parsed = Papa.parse<FloodRow>(text, {
          header: true, dynamicTyping: true, skipEmptyLines: true,
        });
        const valid = parsed.data.filter(
          (r) => r.lat != null && r.long != null && r.flood_next_day != null
        );
        setData(valid);
      }

      if (imgRes && imgRes.ok) {
        setPreviewImages(await imgRes.json());
      } else {
        setPreviewImages([]);
      }

      setSelectedZone(zone);
    } catch (e) {
      console.error("Failed to load flood zone", e);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!data.length) return null;
    const avg = (key: keyof FloodRow) =>
      data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length;
    const floodCount = data.filter((r) => r.flood_next_day === 1).length;
    return {
      avgElevation: avg("elevation"),
      avgRiverDist: avg("distance_from_river"),
      avgSoilMoisture: avg("soil_moisture"),
      avgWaterSpread: avg("water_spread_trend"),
      floodCount,
      safeCount: data.length - floodCount,
    };
  }, [data]);

  const rainfallData = useMemo(() => {
    if (!data.length) return [];
    const avg = (key: keyof FloodRow) =>
      data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length;
    return [
      { day: "Day 1", rainfall: avg("rain_day_1") },
      { day: "Day 2", rainfall: avg("rain_day_2") },
      { day: "Day 3", rainfall: avg("rain_day_3") },
      { day: "Day 4", rainfall: avg("rain_day_4") },
      { day: "Day 5", rainfall: avg("rain_day_5") },
      { day: "Day 6", rainfall: avg("rain_day_6") },
      { day: "Day 7", rainfall: avg("rain_day_7") },
    ];
  }, [data]);

  const mapCenter = useMemo((): [number, number] => {
    if (!data.length) return [23.45, 87.12];
    const avgLat = data.reduce((s, r) => s + r.lat, 0) / data.length;
    const avgLon = data.reduce((s, r) => s + r.long, 0) / data.length;
    return [avgLat, avgLon];
  }, [data]);

  // Zone selection view
  if (!selectedZone) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/simulation")} className="mb-4 text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <Waves className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-orbitron tracking-wider">Flood Prediction</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Select a zone dataset to analyze rainfall, river levels, and flood risk.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone, i) => (
              <motion.div key={zone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card
                  className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-300 group"
                  onClick={() => loadZone(zone)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <Database className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-orbitron">{zone.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Flood prediction dataset</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Click to load flood analysis for this zone.</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => { setSelectedZone(null); setData([]); setPreviewImages([]); }}
            className="mb-3 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Datasets
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <Waves className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-orbitron tracking-wider">
              {selectedZone.name} — Flood Analysis
            </h1>
            {stats && (
              <span
                className="ml-auto px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: (stats.floodCount > stats.safeCount ? "hsl(0,85%,55%)" : "hsl(150,70%,45%)") + "22",
                  color: stats.floodCount > stats.safeCount ? "hsl(0,85%,55%)" : "hsl(150,70%,45%)",
                  border: `1px solid ${stats.floodCount > stats.safeCount ? "hsl(0,85%,55%)" : "hsl(150,70%,45%)"}44`,
                }}
              >
                {stats.floodCount}/{data.length} Flood Predicted
              </span>
            )}
            {previewImages.length > 0 && (
              <DatasetPreview
                basePath={`/data/flood/${selectedZone.folder}/images`}
                images={previewImages}
                title={`${selectedZone.name} — Dataset Images`}
              />
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
              <div className="animate-pulse text-primary font-orbitron">Loading zone data...</div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { icon: TrendingUp, label: "Flood Cases", value: `${stats.floodCount}/${data.length}`, color: "hsl(0, 85%, 55%)" },
                    { icon: Ruler, label: "Avg Elevation", value: `${stats.avgElevation.toFixed(0)}m`, color: "hsl(var(--primary))" },
                    { icon: Waves, label: "River Dist", value: `${stats.avgRiverDist.toFixed(1)} km`, color: "hsl(var(--primary))" },
                    { icon: Droplets, label: "Soil Moisture", value: `${stats.avgSoilMoisture.toFixed(0)}%`, color: "hsl(var(--primary))" },
                    { icon: Activity, label: "Water Spread", value: stats.avgWaterSpread.toFixed(1), color: "hsl(35, 90%, 55%)" },
                    { icon: MapPin, label: "Coordinates", value: `${mapCenter[0].toFixed(2)}, ${mapCenter[1].toFixed(2)}`, color: "hsl(var(--primary))" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                          <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: stat.color }} />
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-lg font-bold font-orbitron" style={{ color: stat.color }}>{stat.value}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Map + Rainfall */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Zone Map — Terrain View
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[350px] w-full relative">
                      <iframe
                        key={`${mapCenter[0]}-${mapCenter[1]}`}
                        title="Zone Map"
                        width="100%" height="100%"
                        style={{ border: 0, borderRadius: "0 0 8px 8px" }}
                        src={`https://maps.google.com/maps?q=${mapCenter[0]},${mapCenter[1]}&t=p&z=13&output=embed`}
                        loading="lazy" allowFullScreen
                      />
                      <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
                        📍 {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-primary" /> Rainfall — Last 7 Days (mm)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rainfallData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--foreground))",
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)} mm`, "Rainfall"]}
                          />
                          <Bar dataKey="rainfall" radius={[4, 4, 0, 0]}>
                            {rainfallData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.rainfall > 60 ? "hsl(0, 85%, 55%)" : entry.rainfall > 30 ? "hsl(35, 90%, 55%)" : "hsl(var(--primary))"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" /> Prediction Data ({data.length} samples)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-auto rounded-lg border border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead>Lat</TableHead>
                          <TableHead>Long</TableHead>
                          <TableHead>Elevation</TableHead>
                          <TableHead>River Dist</TableHead>
                          <TableHead>Soil Moisture</TableHead>
                          <TableHead>River Trend</TableHead>
                          <TableHead>Prediction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, i) => (
                          <TableRow key={i} className="border-border/30">
                            <TableCell className="text-xs">{row.lat}</TableCell>
                            <TableCell className="text-xs">{row.long}</TableCell>
                            <TableCell className="text-xs">{row.elevation}m</TableCell>
                            <TableCell className="text-xs">{row.distance_from_river} km</TableCell>
                            <TableCell className="text-xs">{row.soil_moisture}%</TableCell>
                            <TableCell className="text-xs capitalize">{row.river_trend}</TableCell>
                            <TableCell>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: floodColor(row.flood_next_day) + "22",
                                  color: floodColor(row.flood_next_day),
                                }}
                              >
                                {floodLabel(row.flood_next_day)}
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
