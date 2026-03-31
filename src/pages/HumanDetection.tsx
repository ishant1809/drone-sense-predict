import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ScanEye, Upload, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HumanDetManifest {
  images: string[];
}

const HumanDetection = () => {
  const navigate = useNavigate();
  const [manifest, setManifest] = useState<HumanDetManifest | null>(null);
  const [counts, setCounts] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ postImage: string; count: string } | null>(null);

  useEffect(() => {
    fetch("/data/human-det/manifest.json")
      .then((r) => r.json())
      .then(setManifest)
      .catch(console.error);

    fetch("/data/human-det/count.txt")
      .then((r) => r.text())
      .then((text) => setCounts(text.trim().split("\n")))
      .catch(console.error);
  }, []);

  const handleSelect = (img: string) => {
    setSelectedImage(img);
    setResult(null);
    setProcessing(true);

    // Extract image number from filename (e.g. "3.png" → 3)
    const num = parseInt(img.replace(/\D/g, ""), 10);
    const countLine = counts[num - 1] || "N/A";
    // count.txt format: "1-23" means line 1 → count is after the dash
    const count = countLine.includes("-") ? countLine.split("-")[1].trim() : countLine;

    setTimeout(() => {
      setResult({
        postImage: `/data/human-det/post/${img}`,
        count,
      });
      setProcessing(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/simulation")}
            className="mb-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Simulation
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <ScanEye className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-orbitron tracking-wider">
              Human Detection
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Select a disaster zone image to detect and count humans using AI analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Selection */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Select Input Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[500px] overflow-auto">
                {manifest?.images.map((img) => (
                  <motion.div
                    key={img}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImage === img
                        ? "border-primary shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                    onClick={() => handleSelect(img)}
                  >
                    <img
                      src={`/data/human-det/pre/${img}`}
                      alt={img}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <p className="text-[10px] text-center text-muted-foreground py-1 bg-card/80">
                      {img}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Detection Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!selectedImage && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                  >
                    <ScanEye className="h-12 w-12 mb-4 opacity-40" />
                    <p className="text-sm">Select an image to begin detection</p>
                  </motion.div>
                )}

                {processing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[400px]"
                  >
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-sm text-primary font-orbitron animate-pulse">
                      Running AI Detection...
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Analyzing image for human presence
                    </p>
                  </motion.div>
                )}

                {result && !processing && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="rounded-lg overflow-hidden border border-border/50">
                      <img
                        src={result.postImage}
                        alt="Detection result"
                        className="w-full object-contain max-h-[350px]"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Humans Detected
                        </p>
                        <p className="text-3xl font-bold font-orbitron text-primary">
                          {result.count}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HumanDetection;
