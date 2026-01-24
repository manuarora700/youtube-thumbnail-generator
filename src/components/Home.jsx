import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, Download } from "lucide-react";
import { generateThumbnails } from "../utils/ai";

function Home({ openaiApiKey, geminiApiKey, provider, thumbnailCount }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const currentApiKey = provider === "openai" ? openaiApiKey : geminiApiKey;
  const providerName = provider === "openai" ? "OpenAI" : "Gemini";

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!currentApiKey) {
      setError(`Add your ${providerName} API key`);
      return;
    }
    if (!uploadedImage) {
      setError("Upload an image first");
      return;
    }
    if (!description.trim()) {
      setError("Add a description");
      return;
    }

    setError("");
    setIsGenerating(true);
    setGeneratedThumbnails([]);

    try {
      const thumbnails = await generateThumbnails({
        provider,
        openaiApiKey,
        geminiApiKey,
        imageUrl: uploadedImage,
        description,
        count: thumbnailCount,
      });
      setGeneratedThumbnails(thumbnails);
    } catch (err) {
      setError(err.message || "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }, [currentApiKey, providerName, uploadedImage, description, provider, openaiApiKey, geminiApiKey, thumbnailCount]);

  const handleDownload = useCallback((imageUrl, index) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `thumbnail-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold mb-1">
            Create Thumbnails
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Upload an image and describe what you want
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadedImage 
                    ? "border-[var(--color-accent)]" 
                    : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                }`}
              >
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Click to upload
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your thumbnail..."
                className="w-full h-[180px] px-4 py-3 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !currentApiKey}
              className="w-full bg-[var(--color-accent)] text-white font-medium py-3 px-6 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-accent-light)] transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${thumbnailCount} Thumbnail${thumbnailCount > 1 ? "s" : ""}`
              )}
            </button>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-[var(--color-error)]">{error}</p>
          ) : null}
        </div>

        {/* Generated Thumbnails */}
        {generatedThumbnails.length > 0 ? (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
              Results
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedThumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
                >
                  <img
                    src={thumbnail.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(thumbnail.url, index)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-[var(--color-text)] font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Home;
