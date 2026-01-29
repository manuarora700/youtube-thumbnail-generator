import { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  referenceImages: File[];
  onReferenceImagesChange: (files: File[]) => void;
  selectedTemplate: string | null;
  onTemplateSelect: (template: string | null) => void;
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
}: SidebarProps) {
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleReferenceImageAdd = (newFiles: File[]) => {
    onReferenceImagesChange([...referenceImages, ...newFiles]);
  };

  const handleRemoveReference = (index: number) => {
    onReferenceImagesChange(referenceImages.filter((_, i) => i !== index));
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="w-80 bg-white border-r border-neutral-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Configure your thumbnail generation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Prompt Section */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your thumbnail... e.g., 'A tech review thumbnail with bold text and vibrant colors'"
            className="w-full h-32 p-3 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent placeholder:text-neutral-400"
          />
        </div>

        {/* Template Thumbnails Section */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Style Template
            <span className="text-neutral-400 font-normal ml-1">(optional)</span>
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
                    selectedTemplate === template.id ? null : template.id
                  )
                }
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                  selectedTemplate === template.id
                    ? "border-neutral-900 ring-2 ring-neutral-900/20"
                    : "border-neutral-200 hover:border-neutral-300"
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
            <span className="text-neutral-400 font-normal ml-1">(optional)</span>
          </label>
          <p className="text-xs text-neutral-500 mb-3">
            Add your own images for style inspiration
          </p>

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
              className="w-16 h-16 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
              title="Add reference image"
            >
              <IconPlus className="h-5 w-5 text-neutral-400" />
            </button>

            {/* Reference Image Thumbnails */}
            {referenceImages.map((file, idx) => (
              <motion.div
                key={`ref-${idx}-${file.name}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 group"
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
    </div>
  );
}
