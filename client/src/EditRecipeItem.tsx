import React, { useState } from 'react'



interface newRecipeFace {
    title: string,
    instructions: string,
    ingredients: string[],
    author: string
    cookTime: string
    url: string
    image: string
    createdAt: string
}

const EditRecipeItem = ({itemToDisplay} : any) => {

    const [editRecipe,setEditRecipe] = useState<newRecipeFace>(itemToDisplay);

    const handleRecipeEdit = async (e : React.FormEvent,id: any) => {
        try{
            e.preventDefault();
            const editedRecipe = {_id: itemToDisplay?._id,title: editRecipe?.title,instructions: editRecipe?.instructions,ingredients: editRecipe?.ingredients,url: editRecipe.url,image: editRecipe.image, cookTime: editRecipe.cookTime,author: editRecipe?.author}
            const res = await fetch(`/api/recipes/${id}`,{method: "PUT",headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: editedRecipe.title,instructions: editedRecipe.instructions,ingredients: editedRecipe.ingredients,url: editedRecipe.url,image: editedRecipe.image,cookTime: editedRecipe.cookTime, author: editedRecipe.author})})
            if(res.ok){
                const updatedRecipe = await res.json();
                console.log("Recipe updated successfully",updatedRecipe)
            } else {
                console.log("failed to update recipe",res)
            }
        } catch(err){
            console.log(err)
        } finally {
            console.log("done")
        }
    }

    const editRecipeItemChange = (e : any) => {
        const changeTarget = e.target.id;
        const value = e.target.value
        if(changeTarget === "edit-recipe-title"){
            setEditRecipe((prev) => ({
                ...prev, title: value
            }))
        } else if (changeTarget === "edit-recipe-instructions"){
            setEditRecipe((prev) => ({
                ...prev, instructions: value
            }))
        } else if (changeTarget === "edit-recipe-ingredients"){
            setEditRecipe((prev) => ({
                ...prev,ingredients: value.split(", ")
            }))
        } else if (changeTarget === "edit-recipe-url"){
            setEditRecipe((prev) => ({
                ...prev,url: value
            }))
        } else if (changeTarget === "edit-recipe-image"){
            setEditRecipe((prev) => ({
                ...prev,image: value
            }))
        } else if (changeTarget === "edit-recipe-cooktime"){
            setEditRecipe((prev) => ({
                ...prev,cookTime: value
            }))
        } else if (changeTarget === "edit-recipe-author"){
            setEditRecipe((prev) => ({
                ...prev,author: value
            }))
        }

    }

  return (
    <div>
        <form onSubmit={(e) => handleRecipeEdit(e,itemToDisplay?._id)}>
            <label>Edit recipe title :</label>
            <input value={editRecipe?.title} onChange={editRecipeItemChange} id='edit-recipe-title'/>
            <label>Edit recipe instructions :</label>
            <input value={editRecipe?.instructions} onChange={editRecipeItemChange} id='edit-recipe-instructions'/>
            <label>Edit recipe ingredients :</label>
            <input value={editRecipe?.ingredients} onChange={editRecipeItemChange} id='edit-recipe-ingredients'/>
            <label>Edit recipe url :</label>
            <input value={editRecipe?.url} onChange={editRecipeItemChange} id='edit-recipe-url'/>
            <label>Edit recipe image :</label>
            <input value={editRecipe?.image} onChange={editRecipeItemChange} id='edit-recipe-image'/>
            <label>Edit recipe cook time :</label>
            <input value={editRecipe?.cookTime} onChange={editRecipeItemChange} id='edit-recipe-cooktime'/>
            <label>Edit recipe author :</label>
            <input value={editRecipe?.author} onChange={editRecipeItemChange} id='edit-recipe-author'/>
            <button type='submit' >Confirm Edit 👌</button>
        </form>
    </div>
  )
}

export default EditRecipeItem