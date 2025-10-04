import React, { useState } from 'react'

interface newRecipeFace {
    type: "recipe"
    title: string,
    instructions: string,
    ingredients: string[],
    url: string
    image: string
    cookTime: string
    author: string
}

const AddRecipeItem = () => {

  const [newRecipe,setNewRecipe] = useState<newRecipeFace>({title:'',instructions: '',ingredients: [],url: '',image: '',cookTime: '',author: '',type: "recipe"})

  const [readDisplay,setReadDisplay] = useState({display: 'block'})


  const newRecipeChange = (e : any) => {
    const changeTarget = e.target.id;
    const value = e.target.value;
    if(changeTarget === "new-recipe-title"){
        setNewRecipe((prev) => ({
            ...prev,title: value
        }))
    } else if(changeTarget === "new-recipe-instructions"){
        setNewRecipe((prev) => ({
            ...prev,instructions: value
        }))
    } else if(changeTarget === "new-recipe-ingredients"){
        setNewRecipe((prev) => ({
            ...prev,ingredients: value.split(", ")
        }))
    } else if (changeTarget === "new-recipe-author"){
        setNewRecipe((prev) => ({
            ...prev,author: value
        }))
    } else if (changeTarget === "new-recipe-url"){
        setNewRecipe((prev) => ({
            ...prev,url: value
        }))
    } else if (changeTarget === "new-recipe-image"){
        setNewRecipe((prev) => ({
            ...prev,image: value
        }))
    } else if (changeTarget === "new-recipe-cooktime"){
        setNewRecipe((prev) => ({
            ...prev,cookTime: value
        }))
    }
  }

  const handleRecipeSubmit = async(e : React.FormEvent) => {
      if(newRecipe?.title.length < 1 || newRecipe?.instructions.length < 1 || newRecipe?.author.length < 1){
          return;
      }
      try{
      e.preventDefault();
      const res = await fetch("/api/recipes",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(newRecipe)})
      if(res.ok){
          const addedRecipe = await res.json();
          console.log(addedRecipe)
      } else {
          console.log("failed to add recipe")
      }
      } catch(err){
          console.log(err)
      } finally {
        console.log("recipe added")
        setNewRecipe({title:'',instructions: '',ingredients: [],url: '',image: '',cookTime: '',author: '',type: "recipe"});
      }
    }

  return (
    <div id='additem' style={readDisplay}>
          <form onSubmit={handleRecipeSubmit}>
              <label>New recipe name:</label>
              <input value={newRecipe?.title} onChange={newRecipeChange} id='new-recipe-title'/>
              <label>New recipe instructions:</label>
              <input value={newRecipe?.instructions} onChange={newRecipeChange} id='new-recipe-instructions'/>
              <label>New recipe ingredients:</label>
              <input value={newRecipe?.ingredients} onChange={newRecipeChange} id='new-recipe-ingredients'/>
              <label>New recipe url:</label>
              <input value={newRecipe?.url} onChange={newRecipeChange} id='new-recipe-url'/>
              <label>New recipe image:</label>
              <input value={newRecipe?.image} onChange={newRecipeChange} id='new-recipe-image'/>
              <label>New recipe cook time:</label>
              <input value={newRecipe?.cookTime} onChange={newRecipeChange} id='new-recipe-cooktime'/>
              <label>New recipe author:</label>
              <input value={newRecipe?.author} onChange={newRecipeChange} id='new-recipe-author'/>
              <button type='submit' >Add Recipe ✅</button>
          </form>
          <button onClick={() => setReadDisplay({display: "none"})}>❌</button>
    </div>
  )
}

export default AddRecipeItem