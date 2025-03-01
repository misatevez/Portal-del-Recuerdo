import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from 'mercadopago'

interface PreferenceItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  currency_id: string
  description?: string
  category_id?: string
}

interface PreferenceData {
  items: PreferenceItem[]
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: "approved" | "all"
  notification_url?: string
  statement_descriptor?: string
  external_reference?: string
}

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
})

const preference = new Preference(client)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, price, quantity = 1 } = body

    const preferenceData: PreferenceData = {
      items: [
        {
          id: `premium_credit_${Date.now()}`,
          title,
          unit_price: Number(price),
          quantity: Number(quantity),
          currency_id: "ARS",
          description: "Crédito Premium para Portal del Recuerdo",
          category_id: "credits"
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/precios/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/precios/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/precios/pending`
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
      statement_descriptor: "Portal del Recuerdo",
      external_reference: `credit_purchase_${Date.now()}`
    }

    const response = await preference.create({ body: preferenceData })
    return NextResponse.json({ id: response.id })
  } catch (error) {
    console.error("Error creating preference:", error)
    return NextResponse.json({ error: "Error creating preference" }, { status: 500 })
  }
} 