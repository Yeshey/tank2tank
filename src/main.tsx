// src/main.tsx
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css' // Global styles

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

root.render(
  // <React.StrictMode> // Re-enable if desired, but can cause double useEffect in dev
  <App />
  // </React.StrictMode>
)