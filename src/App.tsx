import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:userId" element={<UserDashboard />} />
    </Routes>
    </>
    
  )
}

export default App
