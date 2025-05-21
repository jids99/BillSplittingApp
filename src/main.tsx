import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TestFirestoreConnection from './components/TestFirestoreConnection';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestFirestoreConnection />
  </StrictMode>,
)
