import './App.css'
import { Gallery } from './components/Gallery'
import playBanner from '/play_store_banner.png'
import appBanner from '/app_store_banner.svg'
import urls from './constants/urls'
import logo from '/logo.png'
import themeSwitchIcon from '/theme-switch.svg'
import themeSwitchIconWhite from '/theme-switch-white.svg'
import { useEffect, useState } from 'react'

function App() {
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
      {/* <div className="flex flex-col items-center justify-center gap-4 w-full md:w-1/2">
        <img className="w-20 rounded-md" src={logo} alt="logo" />
        <h1 className="text-4xl font-bold text-center ">
          Tasa Dolar Venezuela
        </h1>

        <div className="text-center flex flex-col items-center justify-center">
          <span>Consulta la tasa del día</span>
          <span>Realiza cálculos en SEGUNDOS</span>
          <span>Arma solicitudes de pago</span>
        </div>
        <div className="w-full flex gap-4 flex-wrap items-center justify-center">
          <a href={urls.android} target="_blank" rel="noreferrer">
            <img className="w-40" src={playBanner} alt="play store banner" />
          </a>
          <a href={urls.ios} target="_blank" rel="noreferrer">
            <img className="w-40" src={appBanner} alt="app store banner" />
          </a>
        </div>
      </div> */}

      {/* Carousel */}
      {/* <div className="md:w-1/2 h-[80vh] rounded-full text-center flex items-center">
        <Gallery />
      </div> */}
      <div> En construcción... </div>
    </div>
  )
}

export default App
