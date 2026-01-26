# YouTube Thumbnail AI Generator

A modern, open-source web application that uses AI to generate stunning YouTube thumbnails. Upload your image, describe what you want, and let AI create multiple professional thumbnail variations instantly.

![Thumbnail AI Generator](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan) ![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.5-green)

## Features

- **AI-Powered Generation**: Uses Google Gemini 2.5 Flash with image generation to create professional thumbnails
- **Reference Image Support**: Upload a reference image to influence the generated thumbnails
- **Multiple Variations**: Generate 3 thumbnails per request with different styles
- **Modern UI**: Clean, intuitive interface built with React 19, TypeScript, and Tailwind CSS 4
- **Secure**: API keys stored locally in your browser, never sent to external servers
- **Real-time Generation**: See thumbnails appear as they're generated
- **Easy Download**: Download or remove generated thumbnails with a single click
- **Smart Prompts**: Optimized prompts designed specifically for YouTube thumbnails with 16:9 aspect ratio
- **Drag & Drop**: Upload images via drag-and-drop or file picker

## Quick Start

### Prerequisites

- **Node.js v20.19+ or v22.12+** (required by Vite 7)
  - Check your version: `node --version`
  - If using nvm: `nvm use` (will use .nvmrc file)
  - Download Node.js: [https://nodejs.org](https://nodejs.org)
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yt-thumbnail-generator.git
cd yt-thumbnail-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Usage

1. **Add Your API Key**: In the top-right corner, enter your Gemini API key and click "Save"
2. **Upload Image**: Click the upload area or drag-and-drop to select a reference image (optional)
3. **Add Description**: Enter a detailed description of what you want in your thumbnail
4. **Generate**: Click the "Generate Thumbnail" button (generates 3 variations)
5. **Download**: Hover over any generated thumbnail and click the download icon
6. **Remove**: Click the X icon to remove unwanted thumbnails

## How It Works

The application uses Google's Gemini 2.5 Flash image generation model to create thumbnails optimized for YouTube. Each generation includes:

- **High contrast and vibrant colors** for better visibility
- **16:9 aspect ratio** perfect for YouTube
- **Reference image integration** - your uploaded image influences the generated thumbnails
- **Multiple style variations** - generates 3 unique thumbnails per request
- **Optimized prompts** that emphasize clickability and engagement
- **Real-time streaming** - see thumbnails as they're generated

## API Usage & Costs

This application uses Google's Gemini 2.5 Flash image generation model. Pricing:
- Gemini offers a **free tier** with generous limits for developers
- For production use, check current pricing at [Google AI Studio](https://aistudio.google.com/pricing)

Generating 3 thumbnails typically falls within the free tier limits. [Check current pricing](https://ai.google.dev/pricing)

## Technology Stack

- **React 19**: Modern UI framework with latest features
- **TypeScript**: Type-safe development
- **Vite 7**: Lightning-fast build tool and dev server
- **Tailwind CSS 4**: Utility-first styling with latest features
- **Google Gemini API**: AI-powered image generation (Gemini 2.5 Flash)
- **AI SDK by Vercel**: Type-safe AI integration
- **Tabler Icons**: Beautiful icon library
- **Motion (Framer Motion)**: Smooth animations
- **React Dropzone**: Drag-and-drop file uploads

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
yt-thumbnail-generator/
├── src/
│   ├── components/
│   │   ├── upload.tsx        # Main upload interface with file dropzone
│   │   ├── hero.tsx          # Landing page hero section
│   │   └── Home.tsx          # Home page component
│   ├── lib/
│   │   ├── gemini.ts         # Google Gemini API integration
│   │   └── utils.ts          # Utility functions (cn, etc.)
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   ├── App.css
│   └── index.css
├── public/
├── eslint.config.ts          # ESLint configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts            # Vite configuration
├── package.json
└── README.md
```

## Tips for Best Results

1. **Upload a Reference Image**: The AI works best when you provide a reference image to build upon
   - Upload a photo, screenshot, or existing thumbnail to use as a base

2. **Be Specific**: Describe colors, mood, style, and key elements
   - Good: "Epic gaming moment with neon blue and red colors, excited facial expression, bold text saying VICTORY"
   - Bad: "Gaming thumbnail"

3. **Mention Text**: If you want text, specify it clearly
   - Example: "Include large bold text saying 'TOP 10 TIPS'"

4. **Describe Style**: Mention lighting, mood, and aesthetic
   - Example: "Cinematic dramatic lighting, dark background with spotlight"

5. **Keep It Simple**: YouTube thumbnails work best when not overcrowded
   - Focus on one main subject or message

6. **Iterate**: Generate multiple times with different prompts to get the perfect thumbnail

## Security & Privacy

- Your Gemini API key is stored only in your browser's localStorage
- No data is sent to any server except Google's Gemini API
- The application runs entirely client-side
- You maintain full control of your API key and usage
- Images are processed securely through Google's AI infrastructure

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Google Gemini 2.5 Flash](https://ai.google.dev/)
- AI SDK by [Vercel](https://sdk.vercel.ai/)
- Icons by [Tabler Icons](https://tabler.io/icons)
- Animations by [Motion (Framer Motion)](https://motion.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com)

## Troubleshooting

### "crypto.hash is not a function" Error

This error occurs when using Node.js version below 20.19. Please upgrade to Node.js v20.19+ or v22.12+:

```bash
# Using nvm (recommended)
nvm install 20.19.0
nvm use

# Or download from nodejs.org
# https://nodejs.org
```

### API Key Not Working

- Ensure your Gemini API key is correct
- Check that you have API access enabled in [Google AI Studio](https://aistudio.google.com/)
- Verify the key has permissions for Gemini API

### Images Not Generating

- Check browser console for errors
- Verify your API key is saved (look at top-right corner)
- Ensure your Gemini API has image generation enabled
- Check that you haven't exceeded your API quota

## Support

If you encounter any issues or have questions:
- Open an issue on [GitHub Issues](https://github.com/yourusername/yt-thumbnail-generator/issues)
- Check Google's [Gemini API documentation](https://ai.google.dev/docs)
- Visit [AI SDK documentation](https://sdk.vercel.ai/docs) for integration details

## Roadmap

- [ ] Add image editing capabilities
- [ ] Support for custom fonts and text overlays
- [ ] Template library for common thumbnail types
- [ ] Batch processing for multiple videos
- [ ] A/B testing suggestions
- [ ] Integration with YouTube Analytics

---

Made with ❤️ for content creators
