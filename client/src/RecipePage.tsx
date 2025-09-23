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

    const handleRecipeUpdate = async (id: string) => {
        const res = await fetch(`/api/recipes/${id}`,{method: "PUT",headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: newVal.title,instructions: newVal.instructions, ingredients: newVal.ingrediensts,author: newVal.author})})
        if(res.ok){
            const updatedRecipe = await res.json()
            setRecipes(prev => prev.map((item) => item._id === updatedRecipe._id ? updatedRecipe : item))
            console.log("recipe updated succesfully")
        } else {
            console.log("failed to update recipe")
        }
    }

    // update the food blueprint

    const handleFoodUpdate = async (id: string) => {
        const food = foods.filter((item) => {
            if(item._id === id){
                return item;
            }
        })
        const newFood = {_id: food[0]._id,title: "cucumber",foodType: food[0].foodType,author: food[0].author}
        console.log(food)
        const res = await fetch(`/api/foods/${id}`,{method: "PUT", headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: newFood.title,foodType: newFood.foodType, author: newFood.author})})
        if(res.ok){
            const updatedFood = await res.json();
            setFoods(prev => prev.map((item) => item._id === id ? updatedFood : item))
            console.log("food updated successfully")
        } else {
            console.log("failed to update food")
        }
    }

    // send a requeast to api to delete a item with specific id in recipes

    const handleDelete = async (id : string) => {
        const res = await fetch(`/api/recipes/${id}`,{method: "DELETE"})
        console.log(res)
        if (res.ok){
            setRecipes(prev => prev.filter(item => item._id !== id))
        } else {
            console.log("failed to delete recipe")
        }
    }
    // delete func for food

    const handleFoodDelete = async (id : string) => {
        const res = await fetch(`/api/foods/${id}`,{method: "DELETE"})
        if (res.ok){
            setFoods(prev => prev.filter(item => item._id !== id))
        } else {
            console.log("failed to delete food")
        }
    }

  return (
    <div id='recipes'>
        {recipes.length > 0 ? Object.values(recipes).map((item) => (
            <div key={`${item._id}`}>
                {item.title}
                <div onClick={() => handleDelete(item._id)}>DELETE RECIPE</div>
                <div onClick={() => handleRecipeUpdate(item._id)}>UPDATE RECIPE</div>
            </div>
        )) : "loading.."}

        {foods.length > 0 ? Object.values(foods).map((item) => (<div key={item._id} >
            {item.title}
            <div onClick={()=> handleFoodDelete(item._id)}>DELETE FOOD</div>
            <div onClick={() => handleFoodUpdate(item._id)}>UPDATE FOOD</div>
        </div>)) : "loading.."}
    </div>
  )
}

export default RecipePage