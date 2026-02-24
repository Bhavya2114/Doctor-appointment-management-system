import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import AppContextProvider from './context/AppContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DoctorContextProvider>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
  </BrowserRouter>,
)

/* 
“This file is the composition root of the admin SPA. It mounts React with the React 18 root API, injects router context, and wires all global state providers before rendering the application shell. Architecturally, that keeps runtime concerns centralized and keeps App focused on UI and routes. The main tradeoff is provider-nesting complexity: if provider values are not memoized or contexts are too broad, updates can trigger expensive tree-wide re-renders. In production, I’d treat this file as critical infrastructure and add guardrails like root error boundaries, route-level code splitting, and clear ownership of auth/token lifecycle in provider initialization.”
*/