import type { FeatureCardProps } from "../types"

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="elegant-card p-8 rounded-lg text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">{icon}</div>
      <h3 className="text-xl font-andika text-primary mb-4">{title}</h3>
      <p className="text-text/80 font-montserrat">{description}</p>
    </div>
  )
}

