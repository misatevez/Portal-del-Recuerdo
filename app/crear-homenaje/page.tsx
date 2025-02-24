import { Suspense } from "react"
import { CreateTributeForm } from "./CreateTributeForm"

export default function CreateTributePage() {
  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={<div>Cargando...</div>}>
          <CreateTributeForm />
        </Suspense>
      </div>
    </div>
  )
}

