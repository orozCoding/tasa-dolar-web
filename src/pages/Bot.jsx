import { useEffect, useState } from 'react'
import botLogo from '/bot_logo.png'
import themeSwitchIcon from '/theme-switch.svg'
import themeSwitchIconWhite from '/theme-switch-white.svg'
import FeatureBox from '../components/FeatureBox'

function Bot() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    window.matchMedia("(prefers-color-scheme: dark)").matches ?
      setDarkMode(true) :
      setDarkMode(false)
  }, [])

  useEffect(() => {
    if(darkMode) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="w-full px-2 py-8 text-black dark:text-white flex flex-col items-center justify-center gap-8 relative min-h-screen">
      {/* Theme switcher */}
      <img
        className="w-10 rounded-md absolute top-4 left-4 cursor-pointer"
        src={darkMode ? themeSwitchIconWhite: themeSwitchIcon}
        onClick={() => setDarkMode(!darkMode)}
      />

      {/* Bot Logo and Title */}
      <div className="flex flex-col items-center justify-center gap-4 max-w-4xl">
        <img className="w-24 rounded-md" src={botLogo} alt="Telegram Bot Logo" />
        <h1 className="text-4xl font-bold text-center">
          Tasa Dolar Venezuela Bot en Telegram
        </h1>

      </div>

      {/* Features Section */}
      <div className="max-w-4xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">¿Cómo funciona?</h2>

        <div className="flex flex-col items-center gap-8 mb-6">
          <p>
            <a href="https://t.me/TasaDolarVenezuelaBot" target="_blank" rel="noreferrer">
            @TasaDolarVenezuelaBot
            </a>
            {" "}te mantiene al día con la tasa del dólar y euro BCV, y el promedio USDT de Binance.
          </p>

          <p>
            Por $1.99 al mes, recibe notificaciones diarias, accede a comandos para consultar precios al instante, y realiza conversiones entre distintas monedas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureBox icon="💬" title="Comandos Básicos">
            <ul className="space-y-2">
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/ayuda</code> - Obtén la lista de comandos</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/notificar</code> - Activa las notificaciones para el chat actual</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/tasas</code> - Obtén todas las tasas actuales</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/bcv</code> - Obtén todas las tasas BCV actuales</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/usdt</code> - Obtén el último promedio USDT de Binance</li>
            </ul>
          </FeatureBox>

          <FeatureBox icon="🔔" title="Notificaciones">
            <ul className="space-y-2">
              <li>• Notificación diaria sobre nuevas tasas BCV</li>
              <li>• 3 Notificaciones diarias sobre promedio USDT de Binance</li>
              <li>• También puedes solicitar los precios manualmente con los comandos <code>/bcv</code> <code>/usdt</code> <code>/usd</code> <code>/euro</code> <code>/dolar</code> y más</li>
            </ul>
          </FeatureBox>

          <FeatureBox icon="📊" title="Obtener acceso">
            <p>
              Envía un pago de USD $1.99 x cada mes de acceso que desees (puedes pagar meses por adelantado) y escríbele a <a href="https://t.me/TasaDolarVenezuelaBot" target="_blank" rel="noreferrer">@TasaDolarVenezuelaBot</a> el comando <code>/registro</code> seguido de la referencia de tu pago.
            </p>
          </FeatureBox>

          <FeatureBox icon="💰" title="Métodos de pago">
            <ul className="space-y-2">
              <li>• Binance USDT al correo angel.orozco7@gmail.com</li>
              <li>• Pagomóvil (Bs. a la tasa USD BCV) al 04249038554, V21605193, Banco Venezuela</li>
              <li>• USDT (Red Tron TRC20) TCeA4B5fR1UhrkbBhFQRz5CeLagE9tvCuP</li>
            </ul>
          </FeatureBox>
        </div>
      </div>

      

      {/* Call to Action */}
      <div className="max-w-2xl w-full text-center">
        <h2 className="text-2xl font-bold mb-4">¿Listo para empezar?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Únete a cientos de usuarios que ya utilizan nuestro bot para mantenerse actualizados con la tasa del dólar.
        </p>
        <a 
          href="https://t.me/your_bot_username" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Abrir en Telegram
        </a>
      </div>
    </div>
  )
}

export default Bot