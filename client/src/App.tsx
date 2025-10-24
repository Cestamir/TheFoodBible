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
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './reduxstore/store'
import { useEffect } from 'react'
import { setError, setFoods, setLoading, setRecipes } from './reduxstore/itemsSlice'
// more pages to add login/register page, contact page, bmi calculator

function App() {

  const dispatch = useDispatch();
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
