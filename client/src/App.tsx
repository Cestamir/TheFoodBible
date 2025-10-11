import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import RecipePage from './RecipePage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/Navbar'
import HomePage from "./pages/HomePage"
import ContactPage from './pages/ContactPage'
import PlanPage from './pages/PlanPage'

// more pages to add login/register page, contact page, bmi calculator

function App() {

  return (
    <>
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/home' element={<HomePage/>}/>
        <Route path='/unauthorized' element={<UnauthorizedPage/>}/>
        <Route path='/admin' element={<AdminPage/>}/>
        <Route path='/contact' element={<ContactPage/>}/>
        <Route path='/diet' element={<PlanPage/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
