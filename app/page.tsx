import HeroSection from "./components/HeroSection"
import RecentTributes from "./components/tributes/RecentTributes"
import SearchBar from "./components/SearchBar"
import CTASection from "./components/CTASection"
import FeatureCard from "./components/FeatureCard"
import { Heart, CandlestickChartIcon as Candle, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="relative -mt-8 z-10 max-w-2xl mx-auto px-4">
        <SearchBar />
      </div>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-andika text-primary text-center mb-16">Un Espacio para Recordar</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Heart className="w-6 h-6 text-primary" />}
              title="Homenajes Personalizados"
              description="Crea un homenaje único, tan especial como la persona que querés recordar."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Memorias Compartidas"
              description="Un lugar para mantener viva la memoria de quienes amamos, con fotos, mensajes y recuerdos."
            />
            <FeatureCard
              icon={<Candle className="w-6 h-6 text-primary" />}
              title="Velas Virtuales"
              description="Enciende una luz en su honor y deja que su recuerdo brille para siempre."
            />
          </div>
        </div>
      </section>

      <RecentTributes />

      <CTASection />
    </div>
  )
}

