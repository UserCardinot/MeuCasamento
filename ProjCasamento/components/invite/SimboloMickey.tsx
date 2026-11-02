/** Silhueta clássica (cabeça + orelhas). `idade` aparece em amarelo no centro. */
export function SimboloMickey({ className = "", idade }: { className?: string; idade?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} role="img" aria-label="Símbolo do Mickey">
      <circle cx="42" cy="42" r="38" fill="#111111" />
      <circle cx="158" cy="42" r="38" fill="#111111" />
      <circle cx="100" cy="102" r="64" fill="#111111" />
      {idade ? (
        <text
          x="100"
          y="104"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="78"
          fontWeight="700"
          fill="#FFC400"
          stroke="#D6001C"
          strokeWidth="4"
          paintOrder="stroke"
          style={{ fontFamily: "var(--font-mickey-display), ui-rounded, system-ui, sans-serif" }}
        >
          {idade}
        </text>
      ) : null}
    </svg>
  );
}
