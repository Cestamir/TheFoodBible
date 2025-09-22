import React, { useEffect, useState } from 'react'

interface recipeType {
    _id: string,
    title: string,
    instructions: string,
    ingrediensts: string[],
    author: string
    createdAt: string
}

interface foodType {
    _id: string,
    title: string,
    foodType: string,
    author: string
}

const RecipePage = () => {

    const [recipes,setRecipes] = useState<recipeType[]>([]);
    const [foods,setFoods] = useState<foodType[]>([])

    const [newRecipe,setNewRecipe] = useState<recipeType>();

    const newVal = {_id:"1",title: "new title",instructions:"new instuctions",ingrediensts: ["h","e","l","l","o"],author: "edited",Cre: ""}

    useEffect(() => {
    const loadData = async () => {
        try{
        const res = await fetch(`/api/recipes`);
        const data = await res.json();
        console.log("RECIPES",data)
        setRecipes(data);
        } catch (err) {
            console.log(err)
        }
    }
    loadData();
    },[])

    useEffect(() => {
        const loadData = async () => {
            try{
                const res = await fetch("/api/foods");
                const data = await res.json();
                console.log("FOODS ",data)
                setFoods(data)
            } catch (err) {
                console.log(err)
            }
        }
        loadData();
    },[])


    const addNewRecipe = (val: recipeType) => {
        // setNewRecipe({id: "1",title: "new title",instructions:"new instuctions",ingrediensts: ["h","e","l","l","o"],author: "edited"})
        // const postData = async () => {
        //     const dataToPost = newRecipe;
        //     fetch("/api/recipes", {
        //         method: "PUT",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             title: dataToPost?.title,
        //             instructions: dataToPost?.instructions
        //         })
        //         })
        //         .then(response => response.json())
        //         .then(data => console.log(data))
        //         .catch(error => console.error("Error:", error));
        // }
        setNewRecipe(val)
    }

    useEffect(() => {
        if(newRecipe) {
            fetch("/api/recipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newRecipe)
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error("Error:", error));
        }
    },[newRecipe])


    // blueprint for update of the recipe

    const handleUpdate = async (id: string) => {
        const res = await fetch(`/api/recipes/${id}`,{method: "PUT",headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: newVal.title,instructions: newVal.instructions, ingredients: newVal.ingrediensts,author: newVal.author})})
        if(res.ok){
            const updatedRecipe = await res.json()
            setRecipes(prev => prev.map((item) => item._id === updatedRecipe._id ? updatedRecipe : item))
            console.log("recipe updated succesfully")
        } else {
            console.log("failed to update recipe")
        }
    }

    // send a requeast to api to delete a item with specific id

    const handleDelete = async (id : string) => {
        const res = await fetch(`/api/recipes/${id}`,{method: "DELETE"})
        if (res.ok){
            setRecipes(prev => prev.filter(item => item._id !== id))
        }
    }

  return (
    <div id='recipes'>
        {recipes.length > 0 ? Object.values(recipes).map((item) => (
            <div key={`${item._id}`}>
                {item.title}
                <div onClick={() => handleDelete(item._id)}>DELETE RECIPE</div>
                <div onClick={() => handleUpdate(item._id)}>UPDATE RECIPE</div>
            </div>
        )) : "loading.."}

        {foods.length > 0 ? Object.values(foods).map((item) => (<div key={item._id} >
            {item.title}
        </div>)) : "loading.."}
    </div>
  )
}

export default RecipePage