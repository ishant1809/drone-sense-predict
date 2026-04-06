import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ScanEye, Upload, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroBackground3D from "@/components/HeroBackground3D";

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

    const num = parseInt(img.replace(/\D/g, ""), 10);
    const countLine = counts[num - 1] || "N/A";
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <HeroBackground3D />

      <div className="relative z-10 container mx-auto px-4 py-8">
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
            <div className="p-2.5 rounded-xl bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
              <ScanEye className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.1em] text-foreground">
                Human Detection
              </h1>
              <p className="text-xs text-muted-foreground tracking-wide">
                AI-powered disaster zone analysis
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Selection */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="backdrop-blur-xl bg-card/30 border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="tracking-[0.1em] uppercase">Select Input Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[500px] overflow-auto pr-1">
                  {manifest?.images.map((img) => (
                    <motion.div
                      key={img}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                        selectedImage === img
                          ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)] scale-[1.02]"
                          : "border-border/30 hover:border-primary/30"
                      }`}
                      onClick={() => handleSelect(img)}
                    >
                      <img
                        src={`/data/human-det/pre/${img}`}
                        alt={img}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      <p className="text-[9px] text-center text-muted-foreground py-1 bg-card/60 backdrop-blur-sm font-mono">
                        {img}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="backdrop-blur-xl bg-card/30 border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="tracking-[0.1em] uppercase">Detection Result</span>
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
                      <div className="p-6 rounded-full bg-secondary/30 mb-4">
                        <ScanEye className="h-10 w-10 opacity-30" />
                      </div>
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
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                      </div>
                      <p className="text-sm text-primary font-bold mt-6 tracking-[0.15em] animate-pulse uppercase">
                        Running AI Detection...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Analyzing image for human presence
                      </p>
                      {/* Progress bar */}
                      <div className="w-48 h-1 bg-secondary/50 rounded-full mt-4 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, ease: "linear" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {result && !processing && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="rounded-xl overflow-hidden border border-border/30 shadow-lg">
                        <img
                          src={result.postImage}
                          alt="Detection result"
                          className="w-full object-contain max-h-[350px]"
                        />
                      </div>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-4 p-5 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
                      >
                        <div className="p-3 rounded-full bg-primary/10">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                            Humans Detected
                          </p>
                          <p className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.4)]">
                            {result.count}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HumanDetection;
