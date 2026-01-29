import { cn } from "../lib/utils";
import { useRef, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconUpload,
  IconLoader2,
  IconDownload,
  IconX,
  IconMenu2,
} from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import {
  generateThumbnails,
  getStoredApiKey,
  setStoredApiKey,
  GeneratedImage,
} from "../lib/gemini";
import { Lightbox } from "./Lightbox";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  prompt: string;
  referenceImages: File[];
  selectedTemplate: string | null;
  onChange?: (files: File[]) => void;
  onMenuClick?: () => void;
  onPromptChange?: (prompt: string) => void;
}

export const FileUpload = ({
  prompt,
  referenceImages,
  selectedTemplate,
  onChange,
  onMenuClick,
  onPromptChange,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<GeneratedImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setGeneratedImages([]); // Clear previous generations
    onChange && onChange(newFiles);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setGeneratedImages([]);
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      setStoredApiKey(tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setTempApiKey("");
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please add your Gemini API key first");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt in the sidebar");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const images = await generateThumbnails(
        apiKey,
        prompt,
        files[0], // Pass the main image if available
        referenceImages.length > 0 ? referenceImages : undefined,
        selectedTemplate, // Pass selected template
        3, // Generate 3 thumbnails
        (newImage: GeneratedImage) => {
          setGeneratedImages((prev) => [...prev, newImage]);
        },
      );

      if (images.length === 0) {
        setError("No images were generated. Please try again.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate thumbnails",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (image: GeneratedImage, index: number) => {
    const link = document.createElement("a");
    link.href = `data:${image.mimeType};base64,${image.data}`;
    link.download = `thumbnail-${index + 1}.png`;
    link.click();
  };

  const openLightbox = (images: GeneratedImage[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  // Create object URL for the first image file
  const imagePreview = useMemo(() => {
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      return URL.createObjectURL(files[0]);
    }
    return null;
  }, [files]);

  const canGenerate = apiKey && prompt.trim();

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* API Key Status Bar */}
        <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-neutral-100 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
              aria-label="Open menu"
            >
              <IconMenu2 className="h-5 w-5 text-neutral-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 truncate">
                Thumbnail Generator
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 hidden sm:block">
                Upload an image and generate AI-powered thumbnails
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {apiKey ? (
              <>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="hidden sm:inline">API Key Active</span>
                  <span className="sm:hidden">Active</span>
                </div>
                <button
                  onClick={() => {
                    setApiKey(null);
                    localStorage.removeItem("gemini_api_key");
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-600 hidden sm:inline"
                >
                  Remove
                </button>
                <button
                  onClick={() => {
                    setApiKey(null);
                    localStorage.removeItem("gemini_api_key");
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-600 inline sm:hidden"
                >
                  <IconX className="h-4 w-4 text-red-500" />

                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveApiKey();
                  }}
                  placeholder="API key..."
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 w-32 sm:w-48 lg:w-64"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim()}
                  className={cn(
                    "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors",
                    tempApiKey.trim()
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  Save
                </button>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline hidden sm:inline"
                >
                  Get Key
                </a>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Upload Area */}
          <div
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
            {...getRootProps()}
          >
            <motion.div
              onClick={handleClick}
              whileHover="animate"
              className={cn(
                "p-4 sm:p-6 lg:p-8 group/file flex items-center justify-center cursor-pointer relative overflow-hidden",
                files.length > 0 ? "min-h-[200px] sm:min-h-[300px]" : "min-h-[300px] sm:min-h-[400px]"
              )}
            >
              <input
                ref={fileInputRef}
                id="file-upload-handle"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(Array.from(e.target.files || []))
                }
                className="hidden"
              />

              {/* Grid Pattern - only show when no image */}
              {!imagePreview && (
                <div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,white,transparent)]">
                  <GridPattern />
                </div>
              )}

              {/* No files - show upload prompt */}
              {!files.length && (
                <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center">
                  <motion.div
                    layoutId="file-upload"
                    variants={mainVariant}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={cn(
                      "relative group-hover/file:shadow-2xl z-40 bg-white flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 rounded-xl",
                      "shadow-[0px_10px_50px_rgba(0,0,0,0.1)] border border-neutral-200"
                    )}
                  >
                    {isDragActive ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neutral-600 flex flex-col items-center"
                      >
                        Drop it
                        <IconUpload className="h-5 w-5 text-neutral-600 mt-1" />
                      </motion.p>
                    ) : (
                      <IconUpload className="h-6 w-6 text-neutral-400" />
                    )}
                  </motion.div>

                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border-2 border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 mx-auto rounded-xl"
                  />

                  <p className="text-neutral-600 mt-4 sm:mt-6 text-center text-sm sm:text-base">
                    <span className="font-medium">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}

              {/* File preview */}
              {files.length > 0 && imagePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full max-w-2xl mx-auto"
                >
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-[250px] sm:max-h-[400px] object-contain bg-neutral-50"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                      title="Remove image"
                    >
                      <IconX className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2 sm:mt-3 px-1 gap-2">
                    <p className="text-xs sm:text-sm text-neutral-600 truncate">
                      {files[0].name}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-400 shrink-0">
                      {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Mobile Prompt Input - Shows only on mobile after image upload */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 lg:hidden"
            >
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange?.(e.target.value)}
                placeholder="Describe your thumbnail... e.g., 'A tech review thumbnail with bold text and vibrant colors'"
                className="w-full h-24 sm:h-32 p-3 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent placeholder:text-neutral-400"
              />
            </motion.div>
          )}

          {/* Generate Button */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
              className={cn(
                "w-full py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium rounded-xl transition-all flex items-center justify-center gap-2",
                isGenerating || !canGenerate
                  ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-900/20",
              )}
            >
              {isGenerating ? (
                <>
                  <IconLoader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="hidden sm:inline">Generating thumbnail {generatedImages.length + 1} of 3...</span>
                  <span className="sm:hidden">Generating {generatedImages.length + 1}/3...</span>
                </>
              ) : !apiKey ? (
                <span className="inline">Add API Key to Generate</span>
              ) : !prompt.trim() ? (
                <span className="inline">Enter a Prompt to Generate</span>
              ) : (
                "Generate Thumbnails"
              )}
            </button>
            {error && (
              <p className="text-red-500 text-xs sm:text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          {/* Generated Thumbnails */}
          <AnimatePresence>
            {generatedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 sm:mt-8"
              >
                <h3 className="text-base sm:text-lg font-medium text-neutral-800 mb-3 sm:mb-4">
                  Generated Thumbnails
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {generatedImages.map((image, idx) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm cursor-pointer"
                      onClick={() => openLightbox(generatedImages, idx)}
                    >
                      <img
                        src={`data:${image.mimeType};base64,${image.data}`}
                        alt={`Generated thumbnail ${idx + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="hidden absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity lg:flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(image, idx);
                          }}
                          className="p-1.5 sm:p-2 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                          title="Download"
                        >
                          <IconDownload className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedImages((prev) =>
                              prev.filter((_, i) => i !== idx),
                            );
                          }}
                          className="p-1.5 sm:p-2 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                          title="Remove"
                        >
                          <IconX className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-700" />
                        </button>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/70 rounded text-white text-[10px] sm:text-xs">
                        Thumbnail {idx + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 12;
  return (
    <div className="flex bg-gray-100 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`size-10 flex shrink-0 rounded-xs ${
                index % 2 === 0
                  ? "bg-gray-50"
                  : "bg-gray-50 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset]"
              }`}
            />
          );
        }),
      )}
    </div>
  );
}
