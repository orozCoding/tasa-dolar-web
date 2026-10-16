import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Bot from './pages/Bot';
import Tasa from './pages/Tasa';
import Pro from './pages/Pro';

// app.tasadolar.com is Tasa Dolar Pro on the web: the same Netlify site,
// showing only the Pro page whatever the path. On the main domain and deploy
// previews it lives at /pro.
const isProHost = window.location.hostname.startsWith('app.')

function App() {
  if (isProHost) return <Pro />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/bot" element={<Bot />} />
        <Route path="/tasa" element={<Tasa />} />
        <Route path="/pro" element={<Pro />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;