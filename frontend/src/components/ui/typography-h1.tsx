export default function TypographyH1(
  { children, className = '' }: { children: React.ReactNode, className?: string }
) {
  return (
    <h1 className={`scroll-m-20 text-4xl font-extrabold tracking-tight text-balance pb-2 pt-2 ${className}`}>
      {children}
    </h1>
  )
}
