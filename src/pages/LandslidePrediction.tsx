import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import {
  ArrowLeft, Mountain, Droplets, Layers, TreePine, AlertTriangle, MapPin, Activity, Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import DatasetPreview from "@/components/DatasetPreview";

interface ZoneManifest {
  id: string;
  name: string;
  folder: string;
}

interface PredictionRow {
  image: string;
  lat: number;
  lon: number;
  rain_day1: number;
  rain_day2: number;
  rain_day3: number;
  rain_day4: number;
  rain_day5: number;
  rain_day6: number;
  rain_day7: number;
  soil_moisture: number;
  slope: number;
  soil_score: number;
  river_distance: number;
  vegetation: number;
  crack: number;
  risk: number;
  risk_percent: number;
}

const riskColor = (pct: number) => {
  if (pct >= 75) return "hsl(0, 85%, 55%)";
  if (pct >= 50) return "hsl(35, 90%, 55%)";
  if (pct >= 25) return "hsl(50, 90%, 55%)";
  return "hsl(150, 70%, 45%)";
};

const riskLabel = (pct: number) => {
  if (pct >= 75) return "Critical";
  if (pct >= 50) return "High";
  if (pct >= 25) return "Moderate";
  return "Low";
};

const LandslidePrediction = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneManifest[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneManifest | null>(null);
  const [data, setData] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/landslide/manifest.json")
      .then((r) => r.json())
      .then(setZones)
      .catch(console.error);
  }, []);

  const loadZone = async (zone: ZoneManifest) => {
    setLoading(true);
    try {
      const [csvRes, imgRes] = await Promise.all([
        fetch(`/data/landslide/${zone.folder}/predictions.csv`),
        fetch(`/data/landslide/${zone.folder}/image-manifest.json`).catch(() => null),
      ]);

      if (csvRes.ok) {
        const text = await csvRes.text();
        const parsed = Papa.parse<PredictionRow>(text, {
          header: true, dynamicTyping: true, skipEmptyLines: true,
        });
        const validData = parsed.data.filter(
          (r) => r.risk_percent != null && Number.isFinite(Number(r.risk_percent)) && r.lat != null && r.lon != null
        );
        setData(validData);
      }

      if (imgRes && imgRes.ok) {
        setPreviewImages(await imgRes.json());
      } else {
        setPreviewImages([]);
      }

      setSelectedZone(zone);
    } catch (e) {
      console.error("Failed to load zone data", e);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!data.length) return null;
    const avg = (key: keyof PredictionRow) =>
      data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length;
    return {
      avgRisk: avg("risk_percent"),
      avgSoilMoisture: avg("soil_moisture"),
      avgSlope: avg("slope"),
      avgSoilScore: avg("soil_score"),
      avgRiverDist: avg("river_distance"),
      avgVegetation: avg("vegetation"),
      avgCrack: avg("crack"),
    };
  }, [data]);

  const rainfallData = useMemo(() => {
    if (!data.length) return [];
    const avg = (key: keyof PredictionRow) =>
      data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / data.length;
    return [
      { day: "Day 1", rainfall: avg("rain_day1") },
      { day: "Day 2", rainfall: avg("rain_day2") },
      { day: "Day 3", rainfall: avg("rain_day3") },
      { day: "Day 4", rainfall: avg("rain_day4") },
      { day: "Day 5", rainfall: avg("rain_day5") },
      { day: "Day 6", rainfall: avg("rain_day6") },
      { day: "Day 7", rainfall: avg("rain_day7") },
    ];
  }, [data]);

  const mapCenter = useMemo((): [number, number] => {
    if (!data.length) return [30.0757, 78.5206];
    const avgLat = data.reduce((s, r) => s + r.lat, 0) / data.length;
    const avgLon = data.reduce((s, r) => s + r.lon, 0) / data.length;
    return [avgLat, avgLon];
  }, [data]);

  // Dataset selection view
  if (!selectedZone) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/simulation")} className="mb-4 text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <Mountain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-orbitron tracking-wider">Landslide Prediction</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Select a zone dataset to analyze terrain data, rainfall patterns, and predicted landslide risk levels.
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
                        <p className="text-xs text-muted-foreground mt-1">Terrain & risk prediction dataset</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Click to load terrain analysis and risk predictions for this zone.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {zones.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Mountain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading available datasets...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => { setSelectedZone(null); setData([]); setPreviewImages([]); }}
            className="mb-3 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Datasets
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <Mountain className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-orbitron tracking-wider">
              {selectedZone.name} — Landslide Analysis
            </h1>
            {stats && (
              <span
                className="ml-auto px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: riskColor(stats.avgRisk) + "22",
                  color: riskColor(stats.avgRisk),
                  border: `1px solid ${riskColor(stats.avgRisk)}44`,
                }}
              >
                {riskLabel(stats.avgRisk)} Risk — {stats.avgRisk.toFixed(1)}%
              </span>
            )}
            {previewImages.length > 0 && (
              <DatasetPreview
                basePath={`/data/landslide/${selectedZone.folder}/images`}
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
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { icon: AlertTriangle, label: "Avg Risk", value: `${stats.avgRisk.toFixed(1)}%`, color: riskColor(stats.avgRisk) },
                    { icon: Droplets, label: "Soil Moisture", value: stats.avgSoilMoisture.toFixed(2), color: "hsl(var(--primary))" },
                    { icon: Mountain, label: "Slope", value: `${stats.avgSlope.toFixed(1)}°`, color: "hsl(var(--primary))" },
                    { icon: Layers, label: "Soil Score", value: stats.avgSoilScore.toFixed(1), color: "hsl(var(--primary))" },
                    { icon: MapPin, label: "River Dist", value: `${stats.avgRiverDist.toFixed(2)} km`, color: "hsl(var(--primary))" },
                    { icon: TreePine, label: "Vegetation", value: (stats.avgVegetation * 100).toFixed(2) + "%", color: "hsl(150, 70%, 45%)" },
                    { icon: Activity, label: "Crack Index", value: stats.avgCrack.toFixed(3), color: "hsl(35, 90%, 55%)" },
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

              {/* Map + Rainfall Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Zone Map — Risk Overlay
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[350px] w-full relative">
                      <iframe
                        key={`${mapCenter[0]}-${mapCenter[1]}`}
                        title="Zone Map"
                        width="100%" height="100%"
                        style={{ border: 0, borderRadius: "0 0 8px 8px" }}
                        src={`https://maps.google.com/maps?q=${mapCenter[0]},${mapCenter[1]}&t=p&z=14&output=embed`}
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
                            itemStyle={{ color: "#fff" }}
                            formatter={(value: number) => [`${value.toFixed(1)} mm`, "Rainfall"]}
                          />
                          <Bar dataKey="rainfall" radius={[4, 4, 0, 0]}>
                            {rainfallData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.rainfall > 85 ? "hsl(0, 85%, 55%)" : entry.rainfall > 75 ? "hsl(35, 90%, 55%)" : "hsl(var(--primary))"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Risk Factor Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                          { subject: 'Slope', A: stats ? (stats.avgSlope / 45) * 100 : 0 },
                          { subject: 'Moisture', A: stats ? stats.avgSoilMoisture : 0 },
                          { subject: 'Soil Score', A: stats ? stats.avgSoilScore * 100 : 0 },
                          { subject: 'Vegetation', A: stats ? (1 - stats.avgVegetation) * 100 : 0 },
                          { subject: 'Crack Index', A: stats ? stats.avgCrack * 1000 : 0 },
                          { subject: 'River Dist', A: stats ? (1 / (stats.avgRiverDist + 1)) * 100 : 0 },
                        ]}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <Radar
                            name="Risk Factors"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.5}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LandslidePrediction;
