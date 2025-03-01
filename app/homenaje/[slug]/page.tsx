"use client"
import TributeData from "./TributeData"
import { CreditManager } from "../../components/credits/CreditManager"
import { useRouter } from "next/navigation"

export default function TributeDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()

  return <TributeData params={params} />
}

