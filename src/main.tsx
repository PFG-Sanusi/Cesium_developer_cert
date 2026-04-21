import React from 'react'
import ReactDOM from 'react-dom/client'
import { Ion } from 'cesium'
import App from './App'
import { FlightProvider } from './context/FlightContext'
import './index.css'

// Synchronously set Ion access token before root creation
// as per strict requirement.
const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN
if (ionToken) {
  Ion.defaultAccessToken = ionToken
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FlightProvider>
      <App />
    </FlightProvider>
  </React.StrictMode>,
)
