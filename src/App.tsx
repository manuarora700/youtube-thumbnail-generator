import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { FileUpload } from "./components/upload";

function App(): React.JSX.Element {
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        prompt={prompt}
        onPromptChange={setPrompt}
        referenceImages={referenceImages}
        onReferenceImagesChange={setReferenceImages}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
      />

      {/* Main Content */}
      <FileUpload
        prompt={prompt}
        referenceImages={referenceImages}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
}

export default App;
