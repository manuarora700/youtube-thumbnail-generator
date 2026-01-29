import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconPlus, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { cn, extractYouTubeVideoId, fetchYouTubeThumbnail } from "../lib/utils";

interface SidebarProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  referenceImages: File[];
  onReferenceImagesChange: (files: File[]) => void;
  selectedTemplate: string | null;
  onTemplateSelect: (template: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATE_THUMBNAILS = [
  { id: "1", src: "/1.jpg", name: "Style 1" },
  { id: "2", src: "/2.jpg", name: "Style 2" },
  { id: "3", src: "/3.jpg", name: "Style 3" },
];

export function Sidebar({
  prompt,
  onPromptChange,
  referenceImages,
  onReferenceImagesChange,
  selectedTemplate,
  onTemplateSelect,
  isOpen,
  onClose,
}: SidebarProps) {
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleReferenceImageAdd = (newFiles: File[]) => {
    onReferenceImagesChange([...referenceImages, ...newFiles]);
  };

  const handleRemoveReference = (index: number) => {
    onReferenceImagesChange(referenceImages.filter((_, i) => i !== index));
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleAddYouTubeThumbnail = async () => {
    if (!youtubeUrl.trim()) {
      setYoutubeError("Please enter a YouTube URL");
      return;
    }

    setYoutubeError(null);
    setIsLoadingThumbnail(true);

    try {
      const videoId = extractYouTubeVideoId(youtubeUrl.trim());
      if (!videoId) {
        setYoutubeError("Invalid YouTube URL format");
        setIsLoadingThumbnail(false);
        return;
      }

      const thumbnailFile = await fetchYouTubeThumbnail(videoId);
      onReferenceImagesChange([...referenceImages, thumbnailFile]);
      setYoutubeUrl(""); // Clear input on success
    } catch (error) {
      console.error("Error fetching YouTube thumbnail:", error);
      setYoutubeError(
        error instanceof Error
          ? error.message
          : "Failed to fetch thumbnail. Please try again.",
      );
    } finally {
      setIsLoadingThumbnail(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "w-80 bg-white border-r border-neutral-200 h-full flex flex-col",
          "fixed lg:relative inset-y-0 left-0 z-50",
          "lg:translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Configure your thumbnail generation
            </p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <IconX className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Prompt Section */}
          <div className="hidden lg:block">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe your thumbnail... e.g., 'A tech review thumbnail with bold text and vibrant colors'"
              className="w-full h-24 sm:h-32 p-3 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent placeholder:text-neutral-400"
            />
          </div>

          {/* Template Thumbnails Section */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Style Template
              <span className="text-neutral-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              Select a style to guide the AI generation
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATE_THUMBNAILS.map((template) => (
                <button
                  key={template.id}
                  onClick={() =>
                    onTemplateSelect(
                      selectedTemplate === template.id ? null : template.id,
                    )
                  }
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                    selectedTemplate === template.id
                      ? "border-neutral-900 ring-2 ring-neutral-900/20"
                      : "border-neutral-200 hover:border-neutral-300",
                  )}
                >
                  {!imageErrors[template.id] ? (
                    <img
                      src={template.src}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(template.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <span className="text-xs text-neutral-400">
                        {template.name}
                      </span>
                    </div>
                  )}
                  {selectedTemplate === template.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <IconCheck className="w-4 h-4 text-neutral-900" />
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            {selectedTemplate && (
              <button
                onClick={() => onTemplateSelect(null)}
                className="text-xs text-neutral-500 hover:text-neutral-700 mt-2"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Reference Images Section */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reference Images
              <span className="text-neutral-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              Paste a YT link or upload your own
            </p>

            {/* YouTube URL Input */}
            <div className="mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setYoutubeError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoadingThumbnail) {
                      handleAddYouTubeThumbnail();
                    }
                  }}
                  placeholder="Paste YouTube URL..."
                  className="flex-1 px-3 py-2 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent placeholder:text-neutral-400"
                  disabled={isLoadingThumbnail}
                />
                <button
                  onClick={handleAddYouTubeThumbnail}
                  disabled={isLoadingThumbnail || !youtubeUrl.trim()}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0",
                    isLoadingThumbnail || !youtubeUrl.trim()
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-900 text-white hover:bg-neutral-800",
                  )}
                  title="Add YouTube thumbnail"
                >
                  {isLoadingThumbnail ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconPlus className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
              {youtubeError && (
                <p className="text-xs text-red-500 mt-1.5">{youtubeError}</p>
              )}
            </div>

            <input
              ref={referenceInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                handleReferenceImageAdd(Array.from(e.target.files || []))
              }
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              {/* Add Reference Button */}
              <button
                onClick={() => referenceInputRef.current?.click()}
                className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                title="Add reference image"
              >
                <IconPlus className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
              </button>

              {/* Reference Image Thumbnails */}
              {referenceImages.map((file, idx) => (
                <motion.div
                  key={`ref-${idx}-${file.name}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-neutral-200 group"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Reference ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveReference(idx)}
                    className="absolute top-0.5 right-0.5 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <IconX className="h-3 w-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>

            {referenceImages.length > 0 && (
              <p className="text-xs text-neutral-400 mt-2">
                {referenceImages.length} reference image
                {referenceImages.length > 1 ? "s" : ""} added
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
