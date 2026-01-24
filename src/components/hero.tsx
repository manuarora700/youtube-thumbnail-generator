import React from "react";
import { FileUpload } from "./upload";

export function Hero(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto py-20">
      <h1 className="font-bold text-5xl text-black tracking-tight max-w-2xl">
        Create production ready thumbnails in minutes.
      </h1>
      <p className="text-lg text-gray-400 max-w-2xl mt-4">
        Generate stunning YouTube thumbnails with AI. No design skills needed.
      </p>
      <FileUpload />
    </div>
  );
}
