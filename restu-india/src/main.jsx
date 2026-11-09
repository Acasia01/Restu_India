import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './Context/AuthContext'
import { QuoteProvider } from './Context/QuoteContext'
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <QuoteProvider>
        <App />
        <Toaster position="top-right" />
      </QuoteProvider>
    </AuthProvider>
  </BrowserRouter>
)