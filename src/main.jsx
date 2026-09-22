import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SavedProvider } from './context/SavedContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SubscriptionProvider>
          <SavedProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SavedProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
