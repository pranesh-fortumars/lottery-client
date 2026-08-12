import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PaymentProvider } from './context/PaymentContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PaymentProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </PaymentProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
