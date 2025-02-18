import './App.css'
import { Gallery } from './components/Gallery'

function App() {


  return (
    <div className="text-black">
      <h1>Tasa Dolar Venezuela</h1>
      <p>
        Consulta y realiza cálculos con la tasa del día, en SEGUNDOS!
      </p>

      <div>
        <span>Google Play Store logo</span>
        <span>App Store logo</span>
      </div>

      <div>
        <Gallery />
      </div>
    </div>

  )
}

export default App
