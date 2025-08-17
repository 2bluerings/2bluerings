export default function TypographyMuted(
  { children, className = '' }: { children: React.ReactNode, className?: string }
) {
  return (
    <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>
  )
}
