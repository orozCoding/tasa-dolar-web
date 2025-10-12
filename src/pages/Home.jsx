import { Gallery } from '../components/Gallery'
import playBanner from '/play_store_banner.png'
import appBanner from '/app_store_banner.svg'
import urls from '../constants/urls'
import logo from '/logo.png'
import themeSwitchIcon from '/theme-switch.svg'
import themeSwitchIconWhite from '/theme-switch-white.svg'
import { useEffect, useState } from 'react'
import CountUp from 'react-countup'

function Home() {
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
    <div className="w-full px-2 py-5 text-black dark:text-white flex flex-col md:flex-row items-center justify-center gap-4 relative">
      {/* Theme switcher */}
      <img
        className="w-10 rounded-md absolute top-4 left-4 cursor-pointer"
        src={darkMode ? themeSwitchIconWhite: themeSwitchIcon}
        onClick={() => setDarkMode(!darkMode)}
      />

      {/* Logo, title, description, banners */}
      <div className="flex flex-col items-center justify-center gap-4 w-full md:w-1/2">
        <img className="w-20 rounded-md" src={logo} alt="logo" />
        <h1 className="text-4xl font-bold text-center ">
          Tasa Dolar Venezuela
        </h1>

        <div className="text-center flex flex-col gap-4 items-center justify-center">
          <div class="w-full flex gap-2 text-xl text-center justify-center">
            <span>Más de </span>
            <span class="w-18 font-bold">
              <CountUp start={99900} end={100000} duration={10} />
            </span>
            <span>descargas</span>
          </div>

          <div class="w-full flex flex-col gap-2 flex-start text-center">
            <span>🗓️&nbsp;&nbsp;Consulta la tasa del día</span>
            <span>✖️&nbsp;&nbsp;Realiza cálculos en SEGUNDOS</span>
            <span>🔔&nbsp;&nbsp;Notificaciones al cambiar la tasa</span>
            <span>📲&nbsp;&nbsp;Arma solicitudes de pago</span>
          </div>
        </div>

        {/* Download buttons */}
        <div className="w-full flex gap-4 flex-wrap items-center justify-center">
          <a href={urls.android} target="_blank" rel="noreferrer">
            <img className="w-40" src={playBanner} alt="play store banner" />
          </a>
          <a href={urls.ios} target="_blank" rel="noreferrer">
            <img className="w-40" src={appBanner} alt="app store banner" />
          </a>
        </div>
       
      </div>

      {/* Carousel */}
      <div className="md:w-1/2 h-[80vh] rounded-full text-center flex items-center">
        <Gallery />
      </div>
    </div>
  )
}

export default Home
