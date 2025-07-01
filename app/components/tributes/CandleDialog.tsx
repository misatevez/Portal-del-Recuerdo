"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import type { Candle } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface CandleDialogProps {
  tributeId: string
  userId: string
  onCandleLit: (newCandle: Candle) => void
}

export function CandleDialog({ tributeId, userId, onCandleLit }: CandleDialogProps) {
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckboxChange = (checked: boolean) => {
    setIsAnonymous(checked)
    if (checked) {
      setAuthorName('') // Limpiar el nombre si se marca como anónimo
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const candleData = {
      tribute_id: tributeId,
      user_id: userId,
      author_name: isAnonymous ? null : authorName.trim() || null, // Enviar null si es anónimo o el campo está vacío
    }

    const { data, error } = await supabase
      .from('candles')
      .insert(candleData)
      .select()
      .single()

    setIsLoading(false)

    if (error) {
      toast.error('Error al encender la vela. Inténtalo de nuevo.')
      console.error('Error lighting candle:', error)
    } else if (data) {
      toast.success('¡Vela encendida con éxito!')
      onCandleLit(data)
      setIsOpen(false)
      setAuthorName('')
      setIsAnonymous(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Encender una Vela</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Encender una vela</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="col-span-3"
                disabled={isAnonymous}
                placeholder="Tu nombre (opcional)"
              />
            </div>
            <div className="flex items-center space-x-2 col-start-2 col-span-3">
              <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={handleCheckboxChange as (checked: boolean) => void} />
              <Label htmlFor="anonymous">Dejar vela anónima</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Encendiendo...' : 'Encender Vela'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
