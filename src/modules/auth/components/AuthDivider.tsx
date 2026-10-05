/** Separador entre el ingreso social y el formulario de correo (R-03). */
export function AuthDivider({ label = 'o con tu correo' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-small text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
