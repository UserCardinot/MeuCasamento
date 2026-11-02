/** Silhueta clássica (cabeça + orelhas). */
export function SimboloMickey({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} role="img" aria-label="Símbolo do Mickey">
      <circle cx="42" cy="42" r="38" fill="#111111" />
      <circle cx="158" cy="42" r="38" fill="#111111" />
      <circle cx="100" cy="102" r="64" fill="#111111" />
    </svg>
  );
}
