// Prompt templates for common YouTube thumbnail types
export interface PromptTemplate {
    id: string;
    name: string;
    category: string;
    icon: string; // emoji
    prompt: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    // Gaming
    {
        id: "gaming-reaction",
        name: "Gaming Reaction",
        category: "Gaming",
        icon: "🎮",
        prompt: "An intense gaming reaction thumbnail with dramatic lighting, surprised/excited facial expression, game footage in background, bold neon colors (pink, blue, green), and large expressive text overlay",
    },
    {
        id: "gaming-top10",
        name: "Top 10 Games",
        category: "Gaming",
        icon: "🏆",
        prompt: "A dynamic top 10 gaming list thumbnail with multiple game screenshots arranged creatively, large bold '10' number, vibrant gradient background, and exciting action-packed composition",
    },

    // Tech
    {
        id: "tech-review",
        name: "Tech Review",
        category: "Tech",
        icon: "📱",
        prompt: "A clean, professional tech review thumbnail featuring the product prominently centered, subtle gradient background, modern minimalist design, comparison arrows or vs icons if comparing products",
    },
    {
        id: "tech-unboxing",
        name: "Unboxing",
        category: "Tech",
        icon: "📦",
        prompt: "An exciting unboxing thumbnail with hands holding/revealing the product, open box visible, dramatic spotlight lighting, amazed expression, sparkle effects around the product",
    },

    // Tutorial/Education
    {
        id: "tutorial-howto",
        name: "How To Guide",
        category: "Tutorial",
        icon: "📚",
        prompt: "An educational how-to thumbnail with clear step indicators, friendly presenter pointing at key elements, bright and welcoming colors, clean organized layout with numbered steps visible",
    },
    {
        id: "tutorial-tips",
        name: "Tips & Tricks",
        category: "Tutorial",
        icon: "💡",
        prompt: "A helpful tips and tricks thumbnail with lightbulb or brain icon, numbered list preview (3-5 tips), professional presenter, warm inviting colors, and clear readable text",
    },

    // Vlog/Lifestyle
    {
        id: "vlog-travel",
        name: "Travel Vlog",
        category: "Vlog",
        icon: "✈️",
        prompt: "A stunning travel vlog thumbnail featuring a beautiful destination landscape, traveler in frame looking amazed, warm sunset colors, location name overlay, adventure and wanderlust vibes",
    },
    {
        id: "vlog-day",
        name: "Day in Life",
        category: "Vlog",
        icon: "☀️",
        prompt: "A lifestyle day-in-the-life thumbnail with multiple scene snapshots, cozy aesthetic, warm natural lighting, casual authentic feel, soft pastel or earth tone colors",
    },

    // Entertainment
    {
        id: "reaction-video",
        name: "Reaction Video",
        category: "Entertainment",
        icon: "😱",
        prompt: "An exaggerated reaction thumbnail with shocked/surprised facial expression, mouth open wide, hands on face, split screen with content being reacted to, bright contrasting colors",
    },
    {
        id: "challenge-video",
        name: "Challenge",
        category: "Entertainment",
        icon: "🔥",
        prompt: "An exciting challenge video thumbnail with dynamic action pose, bold challenge name text, fire or explosion effects, energetic bright colors, competitive intense mood",
    },

    // Business/Finance
    {
        id: "money-tips",
        name: "Money Tips",
        category: "Business",
        icon: "💰",
        prompt: "A professional finance thumbnail with money/dollar imagery, upward trending graphs, confident presenter in business casual, green and gold color scheme, trust-building clean design",
    },
    {
        id: "productivity",
        name: "Productivity",
        category: "Business",
        icon: "⚡",
        prompt: "A motivational productivity thumbnail with organized workspace, to-do list visuals, clock or timer elements, energetic presenter, clean modern aesthetic with blue and white tones",
    },
];

// Get unique categories from templates
export const TEMPLATE_CATEGORIES = [...new Set(PROMPT_TEMPLATES.map(t => t.category))];
