import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Maintenance from './Maintenance.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  {/* Swap to Maintenance page during downtime */}
   {/* <App/> */}
  <Maintenance />
  </StrictMode>,
)

