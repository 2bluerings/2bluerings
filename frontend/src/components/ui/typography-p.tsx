export default function TypographyP(
  { children, className = '' }: { children: React.ReactNode, className?: string }
) {
  return (
    <p className={`pb-2 pt-2 ${className}`}>
      {children}
    </p>
  )
}
