import './App.css'
import { Gallery } from './components/Gallery'
import playBanner from '/play_store_banner.png'
import appBanner from '/app_store_banner.svg'
import urls from './constants/urls'
import logo from '/logo.png'

function App() {


  return (
    <div className="text-black flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <img className="w-20 rounded-md" src={logo} alt="logo" />
        <h1 className="text-4xl font-bold text-center">
          Tasa Dolar Venezuela
        </h1>
        <div className="text-center flex flex-col items-center justify-center">
          <span>Consulta la tasa del día</span>
          <span>Realiza cálculos en SEGUNDOS</span>
          <span>Arma solicitudes de pago</span>
        </div>
      </div>

      <div className="w-full flex gap-10 flex-wrap items-center justify-center">
        <a href={urls.android} target="_blank" rel="noreferrer">
          <img className="w-40" src={playBanner} alt="play store banner" />
        </a>
        <a href={urls.ios} target="_blank" rel="noreferrer">
          <img className="w-40" src={appBanner} alt="app store banner" />
        </a>
      </div>

      <div className="h-140">
        <Gallery />
      </div>
    </div>
  )
}

export default App
