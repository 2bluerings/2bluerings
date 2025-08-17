export default function TypographyH3(
  { children, className = '' }: { children: React.ReactNode, className?: string }
) {
  return (
    <h3 className={`scroll-m-20 text-2xl font-semibold tracking-tight pb-2 pt-2 ${className}`}>
      {children}
    </h3>
  )
}
