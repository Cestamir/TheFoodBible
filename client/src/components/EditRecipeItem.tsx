import React, { useState } from 'react'
import { isExpiredToken, type Item } from '../utils/types'
import type { recipeFace } from '../utils/types'
import { useNavigate } from 'react-router-dom';


interface EditFormProps {
  itemToDisplay: recipeFace;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

const EditRecipeItem = ({itemToDisplay,onSave,onCancel} : EditFormProps) => {

    const [editRecipe,setEditRecipe] = useState<recipeFace>(itemToDisplay);
    const [currentIngredient,setCurrentIngredient] = useState<string>("");

    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    const handleRecipeEdit = async (e : React.FormEvent,id: any) => {
        try{
            e.preventDefault();
            const editedRecipe = {_id: itemToDisplay?._id,name: editRecipe?.name,instructions: editRecipe?.instructions,ingredients: editRecipe?.ingredients,url: editRecipe.url,imageUrl: editRecipe.imageUrl, cookTime: editRecipe.cookTime,author: editRecipe?.author,diet: editRecipe.diet,createdAt: editRecipe.createdAt}

            if(token && isExpiredToken(token)){
                alert("token expired please login again.")
                localStorage.removeItem("token")
                localStorage.removeItem("role")
                navigate("/login")
            }

            const res = await fetch(`/api/recipes/${id}`,{method: "PUT",headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`},body: JSON.stringify({name: editedRecipe?.name,instructions: editedRecipe?.instructions,ingredients: editedRecipe?.ingredients,url: editedRecipe.url,imageUrl: editedRecipe.imageUrl, cookTime: editedRecipe.cookTime,author: editedRecipe?.author,diet: editedRecipe.diet,createdAt: editedRecipe.createdAt})})

            if(res.ok){
                const updatedRecipe = await res.json();
                console.log("Recipe updated successfully",updatedRecipe)
                onSave(updatedRecipe)
            } else {
                console.log("failed to update recipe",res)
            }
        } catch(err){
            console.log(err)
        } finally {
            console.log("done")
        }
    }

  return (
    <div>
        <form onSubmit={(e) => handleRecipeEdit(e,itemToDisplay?._id)}>
              <label>Edit recipe name:</label>
              <input value={editRecipe?.name} onChange={(e) => setEditRecipe((prev) => ({...prev,name: e.target.value}))} id='new-recipe-title'/>
              <label>edit recipe instructions:</label>
              <input value={editRecipe?.instructions} onChange={(e) => setEditRecipe((prev) => ({...prev,instructions: e.target.value}))} id='edit-recipe-instructions'/>
              <label>edit recipe ingredients:</label>
              <input value={currentIngredient} onChange={(e) => setCurrentIngredient(() => e.target.value )} id='edit-recipe-ingredients'/>
              <button onClick={(e) => {
                e.preventDefault();
                if(currentIngredient){
                    setEditRecipe((prev) => ({...prev,ingredients: [...(prev.ingredients || []),currentIngredient.trim()]}))
                    setCurrentIngredient("");
                }}}>Add ingredient +</button>
                <div style={{width: "200px",height: "200px",overflowY: "scroll"}}>
                    <ul>
                        {editRecipe.ingredients.map((ing,i) => (
                            <li key={i}>
                                Ingredeint {`${i +1}`}: {ing}
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    const filteredIngredients = editRecipe.ingredients.filter((ingredient) => ingredient !== ing );
                                    setEditRecipe((prev) => ({...prev,ingredients: filteredIngredients}))
                                }}>❌</button>
                            </li>
                        ))}
                    </ul>
                </div>
              <label>edit recipe url:</label>
              <input value={editRecipe?.url} onChange={(e) => setEditRecipe((prev) => ({...prev,url: e.target.value}))} id='edit-recipe-url'/>
              <label>edit recipe image:</label>
              <input value={editRecipe?.imageUrl} onChange={(e) => setEditRecipe((prev) => ({...prev,imageUrl: e.target.value}))} id='edit-recipe-image'/>
              <label>edit recipe diet:</label>
                <select value={editRecipe.diet[0]} onChange={(e : any) => setEditRecipe((prev) => ({...prev,diet: [e.target.value]}) )} id='edit-recipe-diet'>
                    <option value="">--Please choose an option--</option>
                    <option value="all">All food</option>
                    <option value="carnivorous">carnivorous</option>
                    <option value="vegetarian">vegetarian</option>
                    <option value="fruitarian">fruitarian</option>
                </select>             
              <label>edit recipe cook time:</label>
              <input placeholder='22s' value={editRecipe?.cookTime} onChange={(e) => setEditRecipe((prev) => ({...prev,cookTime: e.target.value}))} id='edit-recipe-cooktime'/>
              <label>edit recipe author:</label>
              <input value={editRecipe?.author} onChange={(e) => setEditRecipe((prev) => ({...prev,author: e.target.value}))} id='edit-recipe-author'/>

            <button type='submit' >Confirm Edit 👌</button>
            <button onClick={onCancel}>Cancel X</button>
        </form>
    </div>
  )
}

export default EditRecipeItem