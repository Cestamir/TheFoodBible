import React, { useEffect, useState } from 'react'

interface recipeType {
    id: string,
    title: string,
    instructions: string,
    ingrediensts: [string],
    author: string
}

interface foodType {
    id: string,
    title: string,
    foodType: string,
    author: string
}

const RecipePage = () => {

    const [recipes,setRecipes] = useState<recipeType[]>([]);
    const [foods,setFoods] = useState<foodType[]>([])

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

  return (
    <div id='recipes'>
        {recipes.length > 0 ? Object.values(recipes).map((item) => (<div key={item.id}>
            {item.title}
        </div>)) : "loading.."}
        {foods.length > 0 ? Object.values(foods).map((item) => (<div key={item.id}>
            {item.title}
        </div>)) : "loading.."}
    </div>
  )
}

export default RecipePage