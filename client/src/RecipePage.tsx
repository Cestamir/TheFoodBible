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

    const newVal = {id:"1",title: "new title",instructions:"new instuctions",ingrediensts: ["h","e","l","l","o"],author: "edited"}

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


    const addNewRecipe = (newVal: recipeType) => {
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
        setNewRecipe(newVal)
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

    // send a requeast to api to delete a item with specific id

    const handleDelete = async (id : string) => {
        const res = await fetch(`/api/recipes/${id}`,{method: "DELETE"})
        if (res.ok){
            setRecipes(prev => prev.filter(item => item._id !== id))
        }
    }

  return (
    <div id='recipes'>
        {recipes.length > 0 ? Object.values(recipes).map((item) => (<div key={`${item._id}`}>
            {item.title}
            <div onClick={() => handleDelete(item._id)}>DELETE RECIPE</div>
        </div>)) : "loading.."}


        {foods.length > 0 ? Object.values(foods).map((item) => (<div key={item._id} >
            {item.title}
        </div>)) : "loading.."}
    </div>
  )
}

export default RecipePage