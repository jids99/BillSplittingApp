import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './components/Login';
import RegisterUser from './components/RegisterUser';

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <BrowserRouter basename="/BillSplittingApp">
      <App />
    </BrowserRouter>
  </StrictMode>,     
)
