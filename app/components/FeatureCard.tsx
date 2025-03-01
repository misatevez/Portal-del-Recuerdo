import React from "react"

// Definir el tipo localmente
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-primary text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-andika text-primary mb-2">{title}</h3>
      <p className="text-text/80 font-montserrat">{description}</p>
    </div>
  )
}

