import Link from "next/link"

export default function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-andika text-primary mb-8">Términos y Condiciones</h1>

        <div className="space-y-6 text-text/80 font-montserrat">
          <p>
            Bienvenido a Portal del Recuerdo. Al utilizar nuestro servicio, usted acepta cumplir y estar sujeto a los
            siguientes términos y condiciones:
          </p>

          <h2 className="text-xl font-andika text-primary mt-6 mb-3">1. Uso del Servicio</h2>
          <p>
            Portal del Recuerdo es una plataforma para crear y compartir homenajes digitales. Usted se compromete a
            utilizar el servicio de manera respetuosa y de acuerdo con todas las leyes aplicables.
          </p>

          <h2 className="text-xl font-andika text-primary mt-6 mb-3">2. Contenido del Usuario</h2>
          <p>
            Usted es responsable de todo el contenido que publique en Portal del Recuerdo. No debe publicar contenido
            que sea ilegal, ofensivo, difamatorio o que viole los derechos de otros.
          </p>

          <h2 className="text-xl font-andika text-primary mt-6 mb-3">3. Privacidad</h2>
          <p>
            Respetamos su privacidad y nos comprometemos a proteger sus datos personales. Consulte nuestra Política de
            Privacidad para obtener más información sobre cómo recopilamos y utilizamos sus datos.
          </p>

          <h2 className="text-xl font-andika text-primary mt-6 mb-3">4. Modificaciones del Servicio</h2>
          <p>
            Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo
            aviso.
          </p>

          <h2 className="text-xl font-andika text-primary mt-6 mb-3">5. Terminación</h2>
          <p>
            Podemos terminar o suspender su acceso al servicio inmediatamente, sin previo aviso ni responsabilidad, por
            cualquier razón.
          </p>

          <p className="mt-8">
            Al utilizar Portal del Recuerdo, usted acepta estos términos y condiciones. Si no está de acuerdo con ellos,
            por favor no utilice nuestro servicio.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/registro" className="elegant-button px-6 py-2 rounded-md font-andika">
            Volver al Registro
          </Link>
        </div>
      </div>
    </div>
  )
}

