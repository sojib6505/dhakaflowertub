import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AdminApp from './admin/AdminApp.jsx'
import App from './App.jsx'

const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
)
