// import { StrictMode } from 'react' // StrictMode commented out
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode> // StrictMode commented out
    <App />
  // </StrictMode>, // StrictMode commented out
)