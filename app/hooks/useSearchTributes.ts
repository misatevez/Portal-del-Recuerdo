"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { Tribute, SearchFilters, PaginationOptions } from "../types"

interface SearchResult {
  tributes: Tribute[]
  totalPages: number
  loading: boolean
}

export function useSearchTributes(
  searchQuery: string,
  filters: SearchFilters,
  pagination: PaginationOptions,
): SearchResult {
  const [tributes, setTributes] = useState<Tribute[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function searchTributes() {
      try {
        setLoading(true)

        let query = supabase.from("tributes").select("*, candles!left(count)", { count: "exact" })

        if (searchQuery) {
          query = query.ilike("nombre", `%${searchQuery}%`)
        }

        if (filters.year) {
          query = query.eq("date_part('year', fecha_fallecimiento)", filters.year)
        }

        if (filters.location) {
          query = query.ilike("ubicacion", `%${filters.location}%`)
        }

        switch (filters.sortBy) {
          case "recent":
            query = query.order("created_at", { ascending: false })
            break
          case "candles":
            query = query.order("candles(count)", { ascending: false, nullsFirst: false })
            break
          case "name":
            query = query.order("nombre", { ascending: true })
            break
          default:
            query = query.order("created_at", { ascending: false })
        }

        const from = pagination.page * pagination.pageSize
        query = query.range(from, from + pagination.pageSize - 1)

        const { data, error, count } = await query

        if (error) throw error

        if (isMounted) {
          setTributes(data || [])
          setTotalCount(count || 0)
        }
      } catch (err) {
        console.error("Error al buscar homenajes:", err)
        if (isMounted) {
          setTributes([])
          setTotalCount(0)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    searchTributes()

    return () => {
      isMounted = false
    }
  }, [searchQuery, filters, pagination.page, pagination.pageSize])

  return {
    tributes,
    totalPages: Math.ceil(totalCount / pagination.pageSize),
    loading,
  }
}

