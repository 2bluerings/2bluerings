export default function TypographySmall(
  { children, className = '' }: { children: React.ReactNode, className?: string }
) {
  return (
    <small className={`text-sm leading-none font-medium ${className}`}>{children}</small>
  )
}
