import "highlight.js/styles/tokyo-night-dark.min.css"
import TypographyLarge from "./typography-large"
import * as React from "react"

type EmptyStateProps = {
  Icon: React.ComponentType<{ className?: string }>; 
  title: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
  className?: string
  iconClassName?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  Icon,
  title,
  description,
  containerClassName = "",
  className = "",
  iconClassName = "",
}) => {
  return (
    <div className={`absolute inset-0 flex items-center justify-center ${containerClassName}`}>
      <div className={`text-center max-w-md px-6 ${className}`}>
        <div className="flex justify-center mb-3">
          <Icon className={`h-10 w-10 text-muted-foreground ${iconClassName}`} />
        </div>
        <TypographyLarge className="mb-2">{title}</TypographyLarge>
        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

export default EmptyState
