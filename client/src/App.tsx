import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/App.css'
import LandingPage from './pages/LandingPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/Navbar'
import HomePage from "./pages/HomePage"
import ContactPage from './pages/ContactPage'
import PlanPage from './pages/PlanPage'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './reduxstore/store'
import { useEffect } from 'react'
import { setError, setFoods, setLoading, setRecipes } from './reduxstore/itemsSlice'
import LoginPage from './pages/LoginPage'
import { isExpiredToken } from './utils/types'
import AccountPage from './pages/AccountPage'
import { logout } from './reduxstore/authSlice'
import ProtectedRoute from './utils/ProtectedRoute'
import { addFood,addRecipe } from './reduxstore/itemsSlice'

//bmi calculator componet to add


function App() {

    const dispatch = useDispatch();

  const token = localStorage.getItem("token");
    if(token && isExpiredToken(token)){
        alert("please login, token expired.")
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        dispatch(logout())
    }

  const {foods,recipes,loading} = useSelector((state : RootState) => state.items );

  useEffect(() => {
    if(foods.length === 0 && recipes.length === 0 && !loading){
      const loadData = async() => {
        dispatch(setLoading(true));
        try {
          const [recipeResponse,foodResponse] = await Promise.all([fetch("/api/recipes"),fetch("/api/foods")]);
          const recipeData = await recipeResponse.json();
          const foodData = await foodResponse.json();

          dispatch(setFoods(foodData));
          dispatch(setRecipes(recipeData));
          console.log('data loaded from Redux.')
          
        } catch (error) {
          console.log(error,"error while loading data from db.")
          dispatch(setError("Failed to load data."))
        } finally {
          dispatch(setLoading(false));
        }
      }
      loadData();
    }
  },[])

  useEffect(() => {
    const eventSource = new EventSource("/api/items/stream");
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
        switch (data.type) {
        case "food":
          dispatch(addFood(data.payload));
          break;
        case "recipe":
          dispatch(addRecipe(data.payload));
          break;
        default:
          console.warn("Unknown SSE type", data);
        }
    }
    eventSource.onerror = (err) => {
      console.error("SSE error", err);
      eventSource.close();
    };

    return () => eventSource.close();
  },[dispatch])

  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <div className='pagewraper'>
      <Routes>
        <Route path='/admin' element={
        <ProtectedRoute allowedRoutes={["admin"]}>
          <AdminPage/>
        </ProtectedRoute>
        }/>
        <Route path='/account' element={
        <ProtectedRoute allowedRoutes={["admin","user"]}>
          <AccountPage/>
        </ProtectedRoute>
        }/>
        <Route path='/diet' element={
        <ProtectedRoute allowedRoutes={["admin","user"]}>
          <PlanPage/>
        </ProtectedRoute>
        }/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/home' element={<HomePage/>}/>
        <Route path='/unauthorized' element={<UnauthorizedPage/>}/>
        <Route path='/contact' element={<ContactPage/>}/>
      </Routes>
    </div>
    </BrowserRouter>
    </>
  )
}

export default App
