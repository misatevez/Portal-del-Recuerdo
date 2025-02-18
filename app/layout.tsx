import "./globals.css"
import type { Metadata } from "next"
import { Andika, Montserrat_Alternates } from "next/font/google"
import Navbar from "./components/Navbar"
import { Footer } from "./components/Footer"
import { AuthProvider } from "./auth/AuthProvider"
import type React from "react"

const andika = Andika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-andika",
})

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat-alternates",
})

export const metadata: Metadata = {
  title: "Portal del Recuerdo",
  description: "Un espacio digital para honrar la memoria de nuestros seres queridos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${andika.variable} ${montserratAlternates.variable}`}>
      <body className={`min-h-screen bg-background text-text flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-20">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'