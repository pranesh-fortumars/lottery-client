import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { PaymentProvider } from './context/PaymentContext'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PaymentProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </PaymentProvider>
    </AuthProvider>
  </StrictMode>,
)
