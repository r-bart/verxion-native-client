// icons.jsx — Lucide-style line icons (stroke 2, currentColor) + verxion isotype helper.
// Each icon is a small functional component. Exported to window for cross-file use.

function Svg({ size = 22, children, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      {children}
    </svg>
  );
}

const Icon = {
  arrowRight: (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
  chevronRight: (p) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>,
  chevronLeft: (p) => <Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>,
  check: (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>,
  x: (p) => <Svg {...p}><path d="M18 6L6 18M6 6l12 12" /></Svg>,
  eye: (p) => <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Svg>,
  eyeOff: (p) => <Svg {...p}><path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.2 2.9M6.6 6.6A13.3 13.3 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.4-1M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Svg>,
  server: (p) => <Svg {...p}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></Svg>,
  globe: (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></Svg>,
  faceId: (p) => <Svg {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M9 10v1M15 10v1M12 10v3l-1 1M9 15.5a4 4 0 0 0 6 0" /></Svg>,
  flame: (p) => <Svg {...p}><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3 .2 1 1 1.7 1.7 1.7C11 9 9.5 6 12 2Z" /></Svg>,
  dumbbell: (p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  droplet: (p) => <Svg {...p}><path d="M12 2.7l5.3 6.6a6.7 6.7 0 1 1-10.6 0Z" /></Svg>,
  footprints: (p) => <Svg {...p}><path d="M4 16v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM16 14v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM5 9c0-2 .5-4 2-4s1.5 2 1 4M19 7c0-2-.5-4-2-4" /></Svg>,
  scale: (p) => <Svg {...p}><path d="M3 6h18M7 6l-3 7a3 3 0 0 0 6 0L7 6ZM17 6l-3 7a3 3 0 0 0 6 0l-3-7ZM12 3v18M8 21h8" /></Svg>,
  lineChart: (p) => <Svg {...p}><path d="M3 3v18h18M7 14l3-4 3 3 5-6" /></Svg>,
  leaf: (p) => <Svg {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 14-9 16ZM4 20c2-5 5-8 9-9" /></Svg>,
  sparkles: (p) => <Svg {...p}><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" /></Svg>,
  clock: (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  layers: (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  shield: (p) => <Svg {...p}><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /></Svg>,
  send: (p) => <Svg {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" /></Svg>,
  link: (p) => <Svg {...p}><path d="M9 12a3 3 0 0 1 3-3h3a3 3 0 0 1 0 6h-1M15 12a3 3 0 0 1-3 3H9a3 3 0 0 1 0-6h1" /></Svg>,
  github: (p) => <Svg {...p}><path d="M9 19c-4 1.4-4-2-6-2.5M15 22v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 19 4.8 5 5 0 0 0 18.9 1S17.7.6 15 2.5a13.4 13.4 0 0 0-6 0C6.3.6 5.1 1 5.1 1A5 5 0 0 0 5 4.8 5.4 5.4 0 0 0 3.6 8.5c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 0 0-1 2.5V22" /></Svg>,
  camera: (p) => <Svg {...p}><path d="M3 8a2 2 0 0 1 2-2h1.5l1-1.6A1 1 0 0 1 8.4 4h7.2a1 1 0 0 1 .9.4l1 1.6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><circle cx="12" cy="12.5" r="3.2" /></Svg>,
  fileText: (p) => <Svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Svg>,
  mic: (p) => <Svg {...p}><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Svg>,
  plus: (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  undo: (p) => <Svg {...p}><path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-1" /></Svg>,
  edit: (p) => <Svg {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>,
  sliders: (p) => <Svg {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></Svg>,
  arrowUp: (p) => <Svg {...p}><path d="M12 19V5M5 12l7-7 7 7" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v7a2 2 0 0 0 2 2h0V3M7 3v18M17 3c-1.7 0-3 2-3 5s1 4 3 4v9" /></Svg>,
  chevronDown: (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  zap: (p) => <Svg {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" /></Svg>,
  trophy: (p) => <Svg {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4ZM5 4H3v2a3 3 0 0 0 4 3M19 4h2v2a3 3 0 0 1-4 3M9 18h6M10 15h4l1 3H9l1-3Z" /></Svg>,
  trendUp: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7h-6M21 7v6" /></Svg>,
  settings: (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></Svg>,
  search: (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>,
  trash: (p) => <Svg {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></Svg>,
  message: (p) => <Svg {...p}><path d="M21 11.5a8 8 0 0 1-11.7 7.1L3 21l2.4-6.3A8 8 0 1 1 21 11.5Z" /></Svg>,
  cpu: (p) => <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></Svg>,
  history: (p) => <Svg {...p}><path d="M3 3v5h5M3.5 9a9 9 0 1 0 2.1-3.4L3 8" /><path d="M12 7v5l4 2" /></Svg>,
  chevronUpDown: (p) => <Svg {...p}><path d="M8 9l4-4 4 4M8 15l4 4 4-4" /></Svg>,
};

// Brand logos (fixed colors — not currentColor).
function BrandApple({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16.36 12.78c.02 2.84 2.49 3.78 2.52 3.8-.02.07-.39 1.35-1.3 2.67-.78 1.14-1.6 2.28-2.88 2.3-1.26.03-1.66-.74-3.1-.74-1.43 0-1.88.72-3.07.77-1.24.05-2.18-1.23-2.97-2.37-1.6-2.33-2.83-6.59-1.18-9.46.82-1.42 2.28-2.32 3.87-2.35 1.21-.02 2.36.82 3.1.82.74 0 2.13-1.01 3.6-.86.61.02 2.34.25 3.45 1.86-.09.06-2.06 1.2-2.04 3.59M14.13 4.6c.66-.8 1.1-1.91.98-3.02-.95.04-2.1.63-2.78 1.43-.61.71-1.14 1.84-1 2.93 1.06.08 2.14-.54 2.8-1.34" />
    </svg>
  );
}
function BrandGoogle({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1-.34-2.1c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

// verxion brand lockup — isotype + VERXION wordmark (Rubik). For the auth hero.
function BrandLockup({ height = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src="assets/verxion-isotype.png" alt="" draggable="false"
        style={{ height, width: "auto", filter: "drop-shadow(0 0 10px rgba(255,98,98,0.45))" }} />
      <span style={{
        fontFamily: '"Rubik", sans-serif', fontWeight: 700, fontSize: height * 0.82,
        letterSpacing: "0.14em", color: "#fff",
      }}>VERXION</span>
    </div>
  );
}

// verxion isotype as <img>, lava-colored PNG. `glow` adds the signature emissive drop-shadow.
function Isotype({ size = 72, glow = false, opacity = 1, style = {} }) {
  return (
    <img src="assets/verxion-isotype.png" alt="verxion" draggable="false"
      style={{
        width: size, height: 'auto', opacity,
        filter: glow ? 'drop-shadow(0 0 18px rgba(255,98,98,0.55)) drop-shadow(0 0 42px rgba(255,98,98,0.35))' : 'none',
        ...style,
      }} />
  );
}

Object.assign(window, { Icon, Isotype, Svg, BrandApple, BrandGoogle, BrandLockup });
