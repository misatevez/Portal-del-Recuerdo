import type { TributeBiographyProps } from "../../types"

export function TributeBiography({ biografia }: TributeBiographyProps) {
  if (!biografia) return null

  return (
    <div className="prose max-w-none mb-8">
      <p className="text-text/80 font-montserrat">{biografia}</p>
    </div>
  )
}

