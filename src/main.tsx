import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import TestFirestoreConnection from './components/TestFirestoreConnection';
import RegisterUser from './components/RegisterUser';
// import AddFirestore from './components/AddFirestore';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestFirestoreConnection />
    <RegisterUser />
    {/* <AddFirestore /> */}
  </StrictMode>,
)
