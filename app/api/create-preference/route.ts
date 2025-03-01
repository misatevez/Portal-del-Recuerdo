import { NextResponse } from "next/server"
import { Preference } from 'mercadopago'
import { mercadoPagoClient } from '../../lib/mercadopago'

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

const preference = new Preference(mercadoPagoClient)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tributeId, productTitle, price } = body

    const result = await preference.create({
      body: {
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [
            {
              id: "ticket"
            }
          ],
          installments: 1
        },
        items: [
          {
            id: tributeId,
            title: productTitle,
            quantity: 1,
            unit_price: price,
            currency_id: 'ARS'
          }
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/pago/exito`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pago/error`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pago/pendiente`
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`
      }
    })

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point
    })
  } catch (error) {
    console.error("Error al crear preferencia:", error)
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    )
  }
} 