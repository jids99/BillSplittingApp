import './App.css'
import { Routes, Route } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Login from './components/Login';

function App() {

  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/item/:id" element={<UserDashboard />} />
    </Routes>
  )
}

export default App
