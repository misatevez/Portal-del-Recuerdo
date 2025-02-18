"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="elegant-card p-4 rounded-lg backdrop-blur-md">
      <form onSubmit={handleSearch} className="flex items-center">
        <Search className="w-5 h-5 text-primary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar homenajes por nombre..."
          className="elegant-input ml-3 flex-1 bg-transparent outline-none font-montserrat"
        />
        <button type="submit" className="elegant-button ml-4 px-4 py-2 rounded-md font-andika">
          Buscar
        </button>
      </form>
    </div>
  )
}

