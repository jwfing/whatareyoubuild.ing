// The "Ib" monogram, inlined so it inherits the editorial palette: the mark
// uses --ink (not pure black) and its carve uses --paper so it sits cleanly on
// the cream header; the one blue square stays as the brand's single accent.
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="101 90 224 224" className={className} aria-hidden="true">
      <g fill="var(--ink)">
        <path d="M115 100H191V111H178V292H191V304H115V292H128V111H115V100Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M226 147C270 147 294 176 294 226C294 276 270 304 226 304C184 304 159 276 159 226C159 176 184 147 226 147ZM226 164C197 164 181 187 181 226C181 265 197 287 226 287C255 287 273 265 273 226C273 187 255 164 226 164Z"
        />
      </g>
      <rect x="178" y="111" width="6" height="181" fill="var(--paper)" />
      <rect x="289" y="272" width="23" height="32" fill="#0757C8" />
    </svg>
  )
}
