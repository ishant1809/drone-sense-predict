import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatasetPreviewProps {
  /** Base path to the images folder, e.g. "/data/landslide/totaghati-data/images" */
  basePath: string;
  /** List of image filenames */
  images: string[];
  title?: string;
}

const DatasetPreview = ({ basePath, images, title = "Dataset Preview" }: DatasetPreviewProps) => {
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        <Images className="h-4 w-4" />
        Dataset Preview
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="text-lg font-orbitron tracking-wider text-primary">
                {title}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setOpen(false); setSelectedIdx(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            {selectedIdx !== null ? (
              <div className="flex-1 flex items-center justify-center relative px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-primary"
                  onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))}
                  disabled={selectedIdx === 0}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <motion.img
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={`${basePath}/${images[selectedIdx]}`}
                  alt={images[selectedIdx]}
                  className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg border border-border/50"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-primary"
                  onClick={() => setSelectedIdx(Math.min(images.length - 1, selectedIdx + 1))}
                  disabled={selectedIdx === images.length - 1}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-mono">
                  {selectedIdx + 1} / {images.length} — {images[selectedIdx]}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img, i) => (
                    <motion.div
                      key={img}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="cursor-pointer group"
                      onClick={() => setSelectedIdx(i)}
                    >
                      <div className="aspect-square rounded-lg border border-border/50 overflow-hidden bg-card/50 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all">
                        <img
                          src={`${basePath}/${img}`}
                          alt={img}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate text-center">
                        {img}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DatasetPreview;
