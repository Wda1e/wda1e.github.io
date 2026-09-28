import React from 'react';

type P = {size?: number; color?: string; style?: React.CSSProperties};

export const GitHubMark: React.FC<P> = ({size = 48, color = '#fff', style}) => (
	<svg width={size} height={size} viewBox="0 0 16 16" style={style}>
		<path
			fill={color}
			d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
		/>
	</svg>
);

export const RepoIcon: React.FC<P> = ({size = 32, color = '#8b949e', style}) => (
	<svg width={size} height={size} viewBox="0 0 16 16" style={style}>
		<path
			fill={color}
			d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"
		/>
	</svg>
);

export const StarIcon: React.FC<P & {filled?: boolean}> = ({size = 32, color = '#8b949e', filled, style}) => (
	<svg width={size} height={size} viewBox="0 0 16 16" style={style}>
		<path
			fill={color}
			d={
				filled
					? 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z'
					: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z'
			}
		/>
	</svg>
);

export const ForkIcon: React.FC<P> = ({size = 32, color = '#8b949e', style}) => (
	<svg width={size} height={size} viewBox="0 0 16 16" style={style}>
		<path
			fill={color}
			d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
		/>
	</svg>
);

export const CodeIcon: React.FC<P> = ({size = 32, color = '#fff', style}) => (
	<svg width={size} height={size} viewBox="0 0 16 16" style={style}>
		<path
			fill={color}
			d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"
		/>
	</svg>
);

export const Bolt: React.FC<P & {gradient?: boolean; id?: string}> = ({size = 64, color = '#fff', gradient, id = 'bolt', style}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={style}>
		{gradient ? (
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#22D3EE" />
					<stop offset="0.5" stopColor="#A78BFA" />
					<stop offset="1" stopColor="#F472B6" />
				</linearGradient>
			</defs>
		) : null}
		<path d="M13.5 1.5 3.5 13.6h7.1l-1.3 8.9 10.2-12.4h-7.2z" fill={gradient ? `url(#${id})` : color} strokeLinejoin="round" />
	</svg>
);

export const Robot: React.FC<P> = ({size = 64, color = '#22D3EE', style}) => (
	<svg width={size} height={size} viewBox="0 0 64 64" style={style} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round">
		<line x1="32" y1="6" x2="32" y2="15" />
		<circle cx="32" cy="5" r="3" fill={color} stroke="none" />
		<rect x="10" y="15" width="44" height="34" rx="11" />
		<circle cx="24" cy="31" r="4.5" fill={color} stroke="none" />
		<circle cx="40" cy="31" r="4.5" fill={color} stroke="none" />
		<line x1="25" y1="41" x2="39" y2="41" />
		<line x1="4" y1="28" x2="4" y2="36" />
		<line x1="60" y1="28" x2="60" y2="36" />
		<path d="M20 49v7M44 49v7" />
	</svg>
);

export const Cursor: React.FC<P> = ({size = 64, style}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={style}>
		<path d="M3 2 3 19.5 7.6 15.4 10.6 22.2 13.8 20.8 10.9 14.1 17.2 14.1Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
	</svg>
);

export const Sparkle: React.FC<P> = ({size = 32, color = '#fff', style}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={style}>
		<path d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z" fill={color} />
	</svg>
);

/** generic 8-ray asterisk glyph (terminal "welcome" accent) */
export const Asterisk: React.FC<P> = ({size = 32, color = '#D97757', style}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={style} stroke={color} strokeWidth={3} strokeLinecap="round">
		{[0, 45, 90, 135].map((a) => (
			<line key={a} x1="12" y1="2.5" x2="12" y2="21.5" transform={`rotate(${a} 12 12)`} />
		))}
	</svg>
);
