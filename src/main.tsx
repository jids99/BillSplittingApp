import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import Modal from 'react-modal';
import App from './App.tsx'
import './scss/main.scss';

Modal.setAppElement('#root');

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <BrowserRouter basename="/BillSplittingApp">
      <App />
    </BrowserRouter>
  </StrictMode>,     
)
