import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { ThemeProvider } from './contexts/ThemeContext'

// Disable console logs in production
if (import.meta.env.PROD) {
  console.log = () => { };
  console.info = () => { };
  console.warn = () => { };
  console.debug = () => { };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)