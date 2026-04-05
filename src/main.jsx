import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Fix lỗi tương thích của sockjs-client trên môi trường Vite (Tránh lỗi trắng màn hình global is not defined)
if (typeof global === 'undefined') {
  window.global = window;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
