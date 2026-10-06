// Inline SVG icons, drawn here so there is no icon library to ship.
type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.25, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const;

export const Mark = ({ className }: P) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className}>
    <rect x="2" y="6" width="19" height="19" rx="6" fill="#2d1b5e" />
    <rect x="11" y="2" width="19" height="19" rx="6" fill="#c1294a" />
    <path d="M17 11.5l3.2 3.2 5.3-6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Play = ({ className }: P) => (<svg {...base} className={className}><path d="M7 4.5v15l12-7.5z" /></svg>);
export const Trophy = ({ className }: P) => (<svg {...base} className={className}><path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 2.8M16 6h4v2a3 3 0 0 1-4 2.8M12 14v4M8 20h8" /></svg>);
export const Team = ({ className }: P) => (<svg {...base} className={className}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M15.5 14.2c3 0 5.5 1.6 5.5 4.8" /></svg>);
export const Me = ({ className }: P) => (<svg {...base} className={className}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></svg>);
export const Flame = ({ className }: P) => (<svg {...base} className={className}><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4 .2 1.3.9 2 1.7 2.2C10.3 8.5 11 5.5 12 3z" /></svg>);
export const Check = ({ className }: P) => (<svg {...base} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const Cross = ({ className }: P) => (<svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Dash = ({ className }: P) => (<svg {...base} className={className}><path d="M6 12h12" /></svg>);
export const Arrow = ({ className }: P) => (<svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
