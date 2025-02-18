import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getRecentTributes() {
  const { data, error } = await supabase
    .from("tributes")
    .select("*, candles!left(count)")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error al cargar homenajes:", error)
    return []
  }

  return data || []
}

export async function updateUserCredits(userId: string, tributeId: string, credits: number) {
  const { data, error } = await supabase
    .from("premium_credits")
    .update({ credits: credits })
    .eq("user_id", userId)
    .eq("tribute_id", tributeId)
    .select()

  if (error) {
    console.error("Error updating user credits:", error)
    throw error
  }

  return data
}

export async function getUserCredits(userId: string, tributeId: string) {
  const { data, error } = await supabase
    .from("premium_credits")
    .select("credits, premium_end_date")
    .eq("user_id", userId)
    .eq("tribute_id", tributeId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No se encontraron créditos, devolver 0
      return { credits: 0, isPremium: false }
    }
    console.error("Error getting user credits:", error)
    throw error
  }

  const now = new Date()
  const isPremium = data.premium_end_date ? new Date(data.premium_end_date) > now : false

  return { credits: data.credits || 0, isPremium }
}

export async function updateTributePremiumStatus(tributeId: string, esPremium: boolean) {
  const { data, error } = await supabase
    .from("tributes")
    .update({ es_premium: esPremium, estado: esPremium ? "publicado" : "borrador" })
    .eq("id", tributeId)
    .select()

  if (error) {
    console.error("Error updating tribute premium status:", error)
    throw error
  }

  return data
}

export async function createTribute(tributeData: any) {
  const { data, error } = await supabase.from("tributes").insert(tributeData).select()

  if (error) {
    console.error("Error creating tribute:", error)
    throw error
  }

  return data || []
}

export async function getTributeById(tributeId: string) {
  const { data, error } = await supabase.from("tributes").select("*").eq("id", tributeId).single()

  if (error) {
    console.error("Error getting tribute:", error)
    throw error
  }

  return data
}

export async function checkAndUpdateExpiredPremiums() {
  const now = new Date().toISOString()

  // Primero, obtenemos todos los créditos premium expirados
  const { data: expiredCredits, error: fetchError } = await supabase
    .from("premium_credits")
    .select("tribute_id")
    .lt("premium_end_date", now)

  if (fetchError) {
    console.error("Error fetching expired premiums:", fetchError)
    return
  }

  // Luego, actualizamos el estado de los tributos correspondientes
  if (expiredCredits && expiredCredits.length > 0) {
    const expiredTributeIds = expiredCredits.map((credit) => credit.tribute_id)

    const { error: updateError } = await supabase
      .from("tributes")
      .update({ es_premium: false, estado: "borrador" })
      .in("id", expiredTributeIds)

    if (updateError) {
      console.error("Error updating expired tributes:", updateError)
    }
  }
}

export async function createPremiumCredit(userId: string, tributeId: string) {
  const now = new Date()
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

  const { data, error } = await supabase
    .from("premium_credits")
    .insert({
      user_id: userId,
      tribute_id: tributeId,
      credits: 1,
      premium_start_date: now.toISOString(),
      premium_end_date: oneYearLater.toISOString(),
    })
    .select()

  if (error) {
    console.error("Error creating premium credit:", error)
    throw error
  }

  return data
}

