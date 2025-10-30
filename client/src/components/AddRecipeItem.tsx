import React, { useState } from 'react'
import type { Item } from '../utils/types'
import type { newRecipeFace } from '../utils/types';
import { isExpiredToken } from '../utils/types';
import { useNavigate } from 'react-router-dom';


interface addRecipeFormProps{
    onAdd: (item: Item) => void;
    onClose: () => void;
}

const AddRecipeItem = ({onAdd,onClose} : addRecipeFormProps) => {

  const [newRecipe,setNewRecipe] = useState<newRecipeFace>({name:'',instructions: '',ingredients: [],url: '',imageUrl: '',cookTime: '',author: '',type: "recipe",diet: [],createdAt: new Date()})
  const [currentIngredient,setCurrentIngredient] = useState<string>("");

  const token = localStorage.getItem("token")
  const navigate = useNavigate();

  const handleRecipeSubmit = async(e : React.FormEvent) => {
    e.preventDefault();
      if(newRecipe?.name.length < 1 || newRecipe?.instructions.length < 1 || newRecipe?.diet.length < 1 || newRecipe?.ingredients.length < 1){
          return;
      }

      try{
        if(token && isExpiredToken(token)){
            alert("expired token please login again.")
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login")
        }
      const res = await fetch("/api/recipes",{method: "POST",headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`},body: JSON.stringify(newRecipe)})
      if(res.ok){
          const addedRecipe = await res.json();
          onAdd(addedRecipe)
        setNewRecipe({name:'',instructions: '',ingredients: [],url: '',imageUrl: '',cookTime: '',author: '',type: "recipe",diet: [],createdAt: new Date()});
        onClose();
          console.log(addedRecipe)
      } else {
          console.log("failed to add recipe")
      }
      } catch(err){
          console.log(err,"error adding new recipe.")
    }
    }

  return (
    <div id='additem'>
      {/* add new recipe form */}
          <form onSubmit={handleRecipeSubmit}>
              <label>New recipe name:</label>
              <input value={newRecipe?.name} onChange={(e) => setNewRecipe((prev) => ({...prev,name: e.target.value}))} id='new-recipe-title'/>
              <label>New recipe instructions:</label>
              <input value={newRecipe?.instructions} onChange={(e) => setNewRecipe((prev) => ({...prev,instructions: e.target.value}))} id='new-recipe-instructions'/>
              <label>New recipe ingredients:</label>
              <input value={currentIngredient} onChange={(e) => setCurrentIngredient(() => e.target.value )} id='new-recipe-ingredients'/>
              <button onClick={(e) => {
                e.preventDefault();
                if(currentIngredient){
                    setNewRecipe((prev) => ({...prev,ingredients: [...(prev.ingredients || []),currentIngredient.trim()]}))
                    setCurrentIngredient("");
                }}}>Add ingredeint +</button>
              <label>New recipe url:</label>
              <input value={newRecipe?.url} onChange={(e) => setNewRecipe((prev) => ({...prev,url: e.target.value}))} id='new-recipe-url'/>
              <label>New recipe image:</label>
              <input value={newRecipe?.imageUrl} onChange={(e) => setNewRecipe((prev) => ({...prev,imageUrl: e.target.value}))} id='new-recipe-image'/>
              <label>New recipe diet:</label>
                <select value={newRecipe.diet[0] || ''} onChange={(e : any) => setNewRecipe((prev) => ({...prev,diet: [e.target.value]}) )} id='new-recipe-diet'>
                    <option value="">--Please choose an option--</option>
                    <option value="all">All food</option>
                    <option value="carnivorous">carnivorous</option>
                    <option value="vegetarian">vegetarian</option>
                    <option value="fruitarian">fruitarian</option>
                </select>             
              <label>New recipe cook time:</label>
              <input placeholder='22s' value={newRecipe?.cookTime} onChange={(e) => setNewRecipe((prev) => ({...prev,cookTime: e.target.value}))} id='new-recipe-cooktime'/>
              <label>New recipe author:</label>
              <input value={newRecipe?.author} onChange={(e) => setNewRecipe((prev) => ({...prev,author: e.target.value}))} id='new-recipe-author'/>
              <ul>
                {newRecipe.ingredients.map((ing,i) => (
                    <li key={i}>
                        Ingredeint {`${i +1}`}: {ing}
                        <button type='button' onClick={(e) => {
                            e.preventDefault();
                            const filteredIngredients = newRecipe.ingredients.filter((ingredient) => ingredient !== ing );
                            setNewRecipe((prev) => ({...prev,ingredients: filteredIngredients}))
                        }}>❌</button>
                    </li>
                ))}
              </ul>
              <button type='submit' >Add Recipe ✅</button>
          </form>
          <button onClick={() => onClose()}>❌</button>
    </div>
  )
}

export default AddRecipeItem