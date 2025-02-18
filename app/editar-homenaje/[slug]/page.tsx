"use client"

import { useRouter } from "next/navigation"
import { EditTributeForm } from "../../components/tributes/EditTributeForm"

export default function EditTributePage({ params }: { params: { slug: string } }) {
  const router = useRouter()

  const handleClose = () => {
    router.push(`/homenaje/${params.slug}`)
  }

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EditTributeForm slug={params.slug} onClose={handleClose} />
      </div>
    </div>
  )
}

