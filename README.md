# YouTube Thumbnail AI Generator

A modern, open-source web application that uses AI to generate stunning YouTube thumbnails. Upload your image, describe what you want, and let AI create multiple professional thumbnail variations instantly.

![Thumbnail AI Generator](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-Latest-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan) ![OpenAI](https://img.shields.io/badge/OpenAI-DALL%E2%80%A2E%203-green)

## Features

- **AI-Powered Generation**: Uses OpenAI's DALL-E 3 to create professional thumbnails
- **Multiple Variations**: Generate 1-10 thumbnails per request with different styles
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Secure**: API keys stored locally in your browser, never sent to external servers
- **Customizable**: Adjust thumbnail count and provide detailed descriptions
- **Easy Download**: Download generated thumbnails with a single click
- **Smart Prompts**: Optimized prompts designed specifically for YouTube thumbnails

## Quick Start

### Prerequisites

- **Node.js v20.19+ or v22.12+** (required by Vite 7)
  - Check your version: `node --version`
  - If using nvm: `nvm use` (will use .nvmrc file)
  - Download Node.js: [https://nodejs.org](https://nodejs.org)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

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

1. **Add Your API Key**: In the sidebar at the bottom left, enter your OpenAI API key and click "Save"
2. **Configure Settings**: Adjust how many thumbnails you want to generate (1-10)
3. **Upload Image**: Click the upload area to select an image
4. **Add Description**: Describe what you want in your thumbnail (be specific!)
5. **Generate**: Click the "Generate Thumbnails" button
6. **Download**: Hover over any generated thumbnail and click "Download"

## How It Works

The application uses OpenAI's DALL-E 3 API to generate thumbnails optimized for YouTube. Each generation includes:

- **High contrast and vibrant colors** for better visibility
- **16:9 aspect ratio** (1792x1024) perfect for YouTube
- **HD quality** for professional results
- **Multiple style variations** to give you options
- **Optimized prompts** that emphasize clickability and engagement

## API Usage & Costs

This application uses OpenAI's DALL-E 3 API. Pricing (as of 2025):
- **DALL-E 3 HD (1792x1024)**: ~$0.080 per image

Generating 3 thumbnails costs approximately $0.24. [Check current pricing](https://openai.com/pricing)

## Technology Stack

- **React 18**: Modern UI framework
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **OpenAI API**: DALL-E 3 image generation
- **Lucide React**: Beautiful icons

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
│   │   ├── Sidebar.jsx      # Settings and API key configuration
│   │   └── Home.jsx          # Main upload and generation interface
│   ├── utils/
│   │   └── ai.js             # OpenAI API integration and prompt engineering
│   ├── App.jsx               # Main application component
│   ├── App.css
│   └── index.css
├── public/
├── package.json
└── README.md
```

## Tips for Best Results

1. **Be Specific**: Describe colors, mood, style, and key elements
   - Good: "Epic gaming moment with neon blue and red colors, excited facial expression, bold text saying VICTORY"
   - Bad: "Gaming thumbnail"

2. **Mention Text**: If you want text, specify it clearly
   - Example: "Include large bold text saying 'TOP 10 TIPS'"

3. **Describe Style**: Mention lighting, mood, and aesthetic
   - Example: "Cinematic dramatic lighting, dark background with spotlight"

4. **Keep It Simple**: YouTube thumbnails work best when not overcrowded

## Security & Privacy

- Your OpenAI API key is stored only in your browser's localStorage
- No data is sent to any server except OpenAI's API
- The application runs entirely client-side
- You maintain full control of your API key and usage

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

- Built with [OpenAI's DALL-E 3](https://openai.com/dall-e-3)
- Icons by [Lucide](https://lucide.dev)
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

- Ensure your OpenAI API key starts with `sk-`
- Check that you have credits in your OpenAI account
- Verify the key has permissions for DALL-E 3

### Images Not Generating

- Check browser console for errors
- Verify your API key is saved (look at bottom-left of sidebar)
- Ensure your OpenAI account has DALL-E 3 access

## Support

If you encounter any issues or have questions:
- Open an issue on [GitHub Issues](https://github.com/yourusername/yt-thumbnail-generator/issues)
- Check OpenAI's [API documentation](https://platform.openai.com/docs)

## Roadmap

- [ ] Add image editing capabilities
- [ ] Support for custom fonts and text overlays
- [ ] Template library for common thumbnail types
- [ ] Batch processing for multiple videos
- [ ] A/B testing suggestions
- [ ] Integration with YouTube Analytics

---

Made with ❤️ for content creators
