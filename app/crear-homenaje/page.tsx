"use client"

import { useAuth } from "../auth/AuthProvider"
import { CreateTributeForm } from "./CreateTributeForm"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CreateTributePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null // Or you could show a loading message here
  }

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">{user && <CreateTributeForm />}</div>
    </div>
  )
}

