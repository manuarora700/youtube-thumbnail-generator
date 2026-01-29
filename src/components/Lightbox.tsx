import { motion, AnimatePresence } from "motion/react";
import { IconX, IconDownload, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { GeneratedImage } from "../lib/gemini";

interface LightboxProps {
  images: GeneratedImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const currentImage = images[currentIndex];

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImage) {
      const link = document.createElement("a");
      link.href = `data:${currentImage.mimeType};base64,${currentImage.data}`;
      link.download = `thumbnail-${currentIndex + 1}.png`;
      link.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft" && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <IconX className="h-6 w-6" />
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="absolute top-4 right-16 p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <IconDownload className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-0 sm:left-4 p-3 text-white/80 hover:text-white bg-black/20 transition-colors rounded-full hover:bg-white/10 z-50"
            >
              <IconChevronLeft className="h-4 w-4 md:h-8 md:w-8" />
            </button>
          )}

          {/* Image */}
          <motion.div
            key={currentImage.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:${currentImage.mimeType};base64,${currentImage.data}`}
              alt={`Thumbnail ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>

          {/* Next button */}
          {currentIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 text-white/80 bg-black/20 hover:text-white transition-colors rounded-full hover:bg-white/10 z-50 "
            >
              <IconChevronRight className="h-4 w-4 md:h-8 md:w-8" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
