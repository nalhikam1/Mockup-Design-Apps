import { SampleLogo } from '../types/mockup';

// Helper to turn SVG string to data URI
const svgToUri = (svgStr: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgStr.trim())}`;

export const SAMPLE_LOGOS: SampleLogo[] = [
  {
    id: 'coffee-roaster',
    name: 'North Roast Co.',
    category: 'Coffee & Cafe',
    previewBg: '#1f1610',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#e07a5f" stroke-width="6" stroke-dasharray="8 4"/>
        <circle cx="150" cy="150" r="126" fill="#2b1e16"/>
        <path d="M150 65 L175 115 L230 120 L190 158 L200 215 L150 185 L100 215 L110 158 L70 120 L125 115 Z" fill="#f4f1de" opacity="0.15"/>
        <g transform="translate(150, 140)">
          <!-- Coffee bean silhouette with flame -->
          <path d="M-30,-20 C-35,30 25,45 35,-5 C40,-35 -15,-45 -30,-20 Z" fill="#e07a5f"/>
          <path d="M-15,-25 C0,0 -5,15 15,30" stroke="#2b1e16" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M0,-45 C-10,-25 5,-15 0,0 C10,-10 15,-30 0,-45 Z" fill="#f4a261"/>
        </g>
        <text x="150" y="215" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#f4f1de" text-anchor="middle" letter-spacing="4">NORTH ROAST</text>
        <text x="150" y="235" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#e07a5f" text-anchor="middle" letter-spacing="3">COFFEE & SUPPLY CO.</text>
      </svg>
    `),
  },
  {
    id: 'tech-nexus',
    name: 'Nexus AI Labs',
    category: 'Technology',
    previewBg: '#0f172a',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <defs>
          <linearGradient id="grad-tech" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="50%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="300" height="300" rx="40" fill="#090d16"/>
        <g transform="translate(150, 130)">
          <!-- Modern isometric hexagon cube -->
          <path d="M0 -60 L52 -30 L52 30 L0 60 L-52 30 L-52 -30 Z" fill="none" stroke="url(#grad-tech)" stroke-width="8" stroke-linejoin="round"/>
          <path d="M0 -60 L0 0 L52 30" fill="none" stroke="url(#grad-tech)" stroke-width="8" stroke-linejoin="round"/>
          <path d="M0 0 L-52 30" fill="none" stroke="url(#grad-tech)" stroke-width="8" stroke-linejoin="round"/>
          <circle cx="0" cy="0" r="14" fill="#38bdf8"/>
        </g>
        <text x="150" y="228" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="5">NEXUS</text>
        <text x="150" y="248" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#94a3b8" text-anchor="middle" letter-spacing="4">INTELLIGENCE LABS</text>
      </svg>
    `),
  },
  {
    id: 'athletics-crest',
    name: 'Vanguard Athletics',
    category: 'Streetwear & Sports',
    previewBg: '#18181b',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <path d="M70 50 L230 50 L230 190 C230 230 150 265 150 265 C150 265 70 230 70 190 Z" fill="#18181b" stroke="#f59e0b" stroke-width="7"/>
        <path d="M85 65 L215 65 L215 185 C215 215 150 245 150 245 C150 245 85 215 85 185 Z" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.6"/>
        <g transform="translate(150, 140)">
          <!-- Stylized Winged V -->
          <path d="M-50 -45 L-15 35 L0 0 L15 35 L50 -45 L25 -45 L0 15 L-25 -45 Z" fill="#f59e0b"/>
          <polygon points="0,-40 25,-10 -25,-10" fill="#ffffff" opacity="0.9"/>
        </g>
        <text x="150" y="205" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="3">VANGUARD</text>
        <text x="150" y="222" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" fill="#f59e0b" text-anchor="middle" letter-spacing="4">DIV. 1984</text>
      </svg>
    `),
  },
  {
    id: 'solana-botanicals',
    name: 'Aura Botanicals',
    category: 'Eco & Wellness',
    previewBg: '#1c2d27',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <circle cx="150" cy="150" r="135" fill="#1c2d27"/>
        <circle cx="150" cy="150" r="120" fill="none" stroke="#a3e635" stroke-width="2" opacity="0.4"/>
        <g transform="translate(150, 130)">
          <!-- Elegant Monstera Leaf -->
          <path d="M0 -60 C-40 -20 -45 40 0 65 C45 40 40 -20 0 -60 Z" fill="#a3e635"/>
          <path d="M0 -55 L0 60" stroke="#1c2d27" stroke-width="4"/>
          <path d="M0 -20 C-15 -30 -30 -20 -25 -5" stroke="#1c2d27" stroke-width="3" fill="none"/>
          <path d="M0 0 C-20 -10 -35 0 -30 15" stroke="#1c2d27" stroke-width="3" fill="none"/>
          <path d="M0 -15 C15 -25 30 -15 25 0" stroke="#1c2d27" stroke-width="3" fill="none"/>
          <path d="M0 5 C20 -5 35 5 30 20" stroke="#1c2d27" stroke-width="3" fill="none"/>
        </g>
        <text x="150" y="225" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="#f7fee7" text-anchor="middle" letter-spacing="4">AURA</text>
        <text x="150" y="244" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" fill="#bef264" text-anchor="middle" letter-spacing="3">ORGANIC BOTANICALS</text>
      </svg>
    `),
  },
  {
    id: 'craft-beer',
    name: 'Wilderness Brew',
    category: 'Beverage & Craft',
    previewBg: '#172554',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <polygon points="150,20 270,90 270,210 150,280 30,210 30,90" fill="#0f172a" stroke="#38bdf8" stroke-width="6"/>
        <g transform="translate(150, 130)">
          <!-- Mountain peaks & Pine Tree -->
          <polygon points="-70,30 -20,-45 30,30" fill="#1e293b"/>
          <polygon points="-10,30 35,-35 80,30" fill="#334155"/>
          <polygon points="-35,30 0,-60 35,30" fill="#38bdf8"/>
          <!-- Sun behind mountains -->
          <circle cx="0" cy="-20" r="18" fill="#fbbf24"/>
        </g>
        <text x="150" y="205" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="3">WILDERNESS</text>
        <text x="150" y="225" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#38bdf8" text-anchor="middle" letter-spacing="4">BREWING CO.</text>
      </svg>
    `),
  },
  {
    id: 'minimal-geometric',
    name: 'Monolith Design',
    category: 'Minimalist Architecture',
    previewBg: '#09090b',
    svgDataUri: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="#18181b"/>
        <g transform="translate(150, 135)">
          <rect x="-40" y="-40" width="80" height="80" fill="none" stroke="#e4e4e7" stroke-width="6"/>
          <circle cx="0" cy="0" r="28" fill="#e11d48"/>
          <line x1="-55" y1="0" x2="55" y2="0" stroke="#e4e4e7" stroke-width="3"/>
          <line x1="0" y1="-55" x2="0" y2="55" stroke="#e4e4e7" stroke-width="3"/>
        </g>
        <text x="150" y="225" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="6">MONOLITH</text>
        <text x="150" y="244" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500" fill="#a1a1aa" text-anchor="middle" letter-spacing="3">STUDIO ARCHITECTURE</text>
      </svg>
    `),
  },
];
