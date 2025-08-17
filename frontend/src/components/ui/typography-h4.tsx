export default function TypographyH4(
  { children, className = '' }: { children: React.ReactNode, className?: string }
) {
  return (
    <h4 className={`scroll-m-20 text-xl font-semibold tracking-tight pb-2 pt-2 ${className}`}>
      {children}
    </h4>
  )
}
