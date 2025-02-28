"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { TributeCard } from "../components/TributeCard"
import { useSearchTributes } from "../hooks/useSearchTributes"
import { supabase } from "../lib/supabase"
import { toast } from "react-hot-toast"

const ITEMS_PER_PAGE = 12

export default function ExplorePage() {
  const [busqueda, setBusqueda] = useState("")
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [filtros, setFiltros] = useState({
    year: "",
    location: "",
    sortBy: "recent" as "recent" | "candles" | "name",
  })
  const [currentPage, setCurrentPage] = useState(0)
  
  // Estados para las opciones de filtros dinámicos
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [loadingFilters, setLoadingFilters] = useState(true)

  // Cargar años y ubicaciones disponibles desde la base de datos
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoadingFilters(true)
      try {
        // Cargar años únicos de fallecimiento
        const { data: yearsData, error: yearsError } = await supabase
          .from('tributes')
          .select('fecha_fallecimiento')
          .not('fecha_fallecimiento', 'is', null)
        
        if (yearsError) throw yearsError
        
        // Extraer años únicos de las fechas
        const years = yearsData
          .map(tribute => new Date(tribute.fecha_fallecimiento).getFullYear().toString())
          .filter((year, index, self) => self.indexOf(year) === index)
          .sort((a, b) => parseInt(b) - parseInt(a)) // Ordenar de más reciente a más antiguo
        
        setAvailableYears(years)
        
        // Cargar ubicaciones únicas
        const { data: locationsData, error: locationsError } = await supabase
          .from('tributes')
          .select('ubicacion')
          .not('ubicacion', 'is', null)
        
        if (locationsError) throw locationsError
        
        // Extraer ubicaciones únicas
        const locations = locationsData
          .map(tribute => tribute.ubicacion)
          .filter(Boolean) // Eliminar valores nulos o vacíos
          .filter((location, index, self) => self.indexOf(location) === index)
          .sort() // Ordenar alfabéticamente
        
        setAvailableLocations(locations)
      } catch (error) {
        console.error("Error al cargar opciones de filtros:", error)
        toast.error("No se pudieron cargar todas las opciones de filtros")
      } finally {
        setLoadingFilters(false)
      }
    }
    
    loadFilterOptions()
  }, [])

  // Debounce para la búsqueda
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(busqueda)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  // Reset página cuando cambian los filtros o la búsqueda
  useEffect(() => {
    setCurrentPage(0)
  }, [filtros, busqueda])

  const { tributes, totalPages, loading } = useSearchTributes(debouncedBusqueda, filtros, {
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-andika text-primary mb-4">Explorar Homenajes</h1>
        <p className="text-text/80 font-montserrat">
          Descubre los homenajes creados por nuestra comunidad para honrar la memoria de sus seres queridos.
        </p>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary/60" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="elegant-input block w-full pl-10 pr-3 py-2 rounded-md font-montserrat"
            />
          </div>
          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className="px-4 py-2 border border-primary/30 rounded-md text-text hover:bg-primary/10 flex items-center font-andika"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Panel de Filtros */}
        {filtrosAbiertos && (
          <div className="mt-4 p-4 elegant-card rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Año de Fallecimiento
                </label>
                <select
                  value={filtros.year}
                  onChange={(e) => setFiltros({ ...filtros, year: e.target.value })}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                  disabled={loadingFilters}
                >
                  <option value="">Todos</option>
                  {loadingFilters ? (
                    <option value="" disabled>Cargando...</option>
                  ) : (
                    availableYears.map((año) => (
                      <option key={año} value={año}>
                        {año}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">Ubicación</label>
                <select
                  value={filtros.location}
                  onChange={(e) => setFiltros({ ...filtros, location: e.target.value })}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                  disabled={loadingFilters}
                >
                  <option value="">Todas</option>
                  {loadingFilters ? (
                    <option value="" disabled>Cargando...</option>
                  ) : (
                    availableLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">Ordenar por</label>
                <select
                  value={filtros.sortBy}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      sortBy: e.target.value as "recent" | "candles" | "name",
                    })
                  }
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                >
                  <option value="recent">Más reciente</option>
                  <option value="name">Nombre</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Homenajes */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-primary/20 aspect-square rounded-lg mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-primary/20 rounded w-3/4" />
                    <div className="h-4 bg-primary/20 rounded w-1/2" />
                  </div>
                </div>
              ))}
          </div>
        ) : tributes.length === 0 ? (
          <div className="text-center py-12 elegant-card rounded-lg">
            <p className="text-text/80 font-montserrat">No se encontraron homenajes que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tributes.map((tribute) => (
                <TributeCard
                  key={tribute.id}
                  id={tribute.id}
                  slug={tribute.slug || tribute.id}
                  nombre={tribute.nombre}
                  fechaNacimiento={tribute.fecha_nacimiento}
                  fechaFallecimiento={tribute.fecha_fallecimiento}
                  imagen={
                    tribute.imagen_principal ||
                    "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80"
                  }
                  isOwner={false}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onTogglePremium={() => {}}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-md border border-primary/30 text-text hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`
                        w-8 h-8 rounded-md flex items-center justify-center text-sm font-andika
                        ${currentPage === i ? "bg-primary text-background" : "text-text hover:bg-primary/10"}
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-md border border-primary/30 text-text hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

