import { PlatformSettingsProvider } from "./hooks/usePlatformSettings";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <PlatformSettingsProvider>
          <App />
        </PlatformSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
