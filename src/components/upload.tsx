import { cn } from "../lib/utils";
import { useRef, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconUpload,
  IconLoader2,
  IconDownload,
  IconX,
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

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");
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
      setError("Please enter a prompt for thumbnail generation");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const images = await generateThumbnails(
        apiKey,
        prompt,
        files[0], // Pass the reference image if available
        3, // Generate 3 thumbnails
        (newImage) => {
          // Add each image as it's generated
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

  return (
    <>
      <div
        className="w-full shadow-sm shadow-black/10 ring-1 bg-white ring-black/5 rounded-md mt-12 min-h-140 flex flex-col"
        {...getRootProps()}
      >
        <motion.div
          onClick={handleClick}
          whileHover="animate"
          className="p-10 group/file flex items-center justify-center rounded-lg cursor-pointer w-full relative overflow-hidden h-full flex-1"
        >
          <input
            ref={fileInputRef}
            id="file-upload-handle"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
          />

          {/* Background Image Preview */}

          {/* Grid Pattern - only show when no image */}
          {!imagePreview && (
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
              <GridPattern />
            </div>
          )}

          <div className="flex flex-col items-center justify-between h-full w-full">
            {/* Upload icon area - only show when no files */}
            {!files.length && (
              <div className="relative w-full mt-10 max-w-xl mx-auto flex-1 flex items-center justify-center">
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 w-full max-w-[8rem] mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]",
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 w-full max-w-[8rem] mx-auto rounded-md"
                ></motion.div>
              </div>
            )}

            {/* File preview and prompt input */}
            {files.length > 0 && (
              <div className="relative w-full mx-auto mt-auto z-10 flex flex-row gap-6 items-stretch">
                {/* Image preview card */}
                {files.map((file, idx) => (
                  <motion.div
                    key={"file" + idx}
                    layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "overflow-hidden z-40 bg-white/90 backdrop-blur-sm dark:bg-neutral-900/90 flex flex-col items-end justify-end p-4 mt-4 min-w-90 max-w-90 rounded-md relative min-h-100",
                      "border border-neutral-200",
                    )}
                  >
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 object-top-left mask-b-from-10% mask-b-to-80%"
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                    <div className="flex justify-between w-full items-center gap-4 relative z-50">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="text-sm text-neutral-500 font-mono dark:text-neutral-300 truncate max-w-xs"
                      >
                        {file.name}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                    </div>

                    <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                      >
                        {file.type}
                      </motion.p>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                      >
                        modified{" "}
                        {new Date(file.lastModified).toLocaleDateString()}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}

                {/* Prompt textarea and generate button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 mt-4 flex flex-col gap-4 min-h-100"
                >
                  <div className="flex-1 relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Example: A stunning thumbnail for a YouTube video about the latest trends in technology. Keep the image provided in the center and create a comparison photo."
                      className="w-full h-full min-h-[180px] p-4 text-sm text-neutral-700 dark:text-neutral-300 bg-white border border-neutral-200 dark:border-neutral-800 rounded-md resize-none focus:outline-none  focus:ring-neutral-300  placeholder:text-neutral-400"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerate();
                      }}
                      disabled={isGenerating || !apiKey}
                      className={cn(
                        "w-full absolute inset-x-0 bottom-0 py-3 px-6 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 flex items-center justify-center gap-2",
                        isGenerating || !apiKey
                          ? "bg-neutral-400 text-neutral-200 cursor-not-allowed"
                          : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100",
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : !apiKey ? (
                        "Add API Key Below"
                      ) : (
                        "Generate Thumbnail"
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-2">{error}</p>
                  )}
                </motion.div>
              </div>
            )}

            {/* Loading state */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full mt-8 flex flex-col items-center justify-center py-8"
              >
                <IconLoader2 className="h-6 w-6 animate-spin text-neutral-500 mb-2" />
                <p className="text-neutral-500 text-sm">
                  Generating thumbnail {generatedImages.length + 1} of 3...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* API Key Saved Indicator */}
        {apiKey && (
          <div
            className="fixed top-6 right-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white shadow-black/10 ring-1 ring-black/5 shadow-sm rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">
                  API Key is Active
                </span>
              </div>
              <button
                onClick={() => {
                  setApiKey(null);
                  localStorage.removeItem("gemini_api_key");
                }}
                className="text-xs text-neutral-400 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generated Thumbnails */}
      <AnimatePresence>
        {generatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-neutral-800 mb-4">
              Generated Thumbnails
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedImages.map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-white shadow-sm cursor-pointer"
                  onClick={() => openLightbox(generatedImages, idx)}
                >
                  <img
                    src={`data:${image.mimeType};base64,${image.data}`}
                    alt={`Generated thumbnail ${idx + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image, idx);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                      title="Download"
                    >
                      <IconDownload className="h-5 w-5 text-neutral-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGeneratedImages((prev) =>
                          prev.filter((_, i) => i !== idx),
                        );
                      }}
                      className="p-2 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                      title="Remove"
                    >
                      <IconX className="h-5 w-5 text-neutral-700" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                    Thumbnail {idx + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fixed API Key Input at Bottom */}

      <AnimatePresence>
        {!apiKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-6 right-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white shadow-sm shadow-black/10 ring-1 ring-black/5 rounded-lg  p-4 flex flex-col gap-3 w-[400px]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">
                  Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  Get API Key
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveApiKey();
                    }
                  }}
                  placeholder="Enter your Gemini API key..."
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-300"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim()}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    tempApiKey.trim()
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed",
                  )}
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-neutral-400">
                Your API key is stored locally in your browser.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox for full-size image viewing */}
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
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`size-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        }),
      )}
    </div>
  );
}
