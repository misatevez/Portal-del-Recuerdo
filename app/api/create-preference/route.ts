import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
})

const preference = new Preference(client)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, price, quantity = 1 } = body

    const preferenceData = {
      items: [
        {
          title,
          unit_price: Number(price),
          quantity: Number(quantity),
          currency_id: "ARS"
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/precios/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/precios/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/precios/pending`
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`
    }

    const response = await preference.create({ body: preferenceData })
    return NextResponse.json({ id: response.id })
  } catch (error) {
    console.error("Error creating preference:", error)
    return NextResponse.json({ error: "Error creating preference" }, { status: 500 })
  }
} 