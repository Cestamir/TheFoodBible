import React, { useEffect, useState } from 'react'

interface recipeType {
    id: string,
    title: string,
    instructions: string,
    ingrediensts: [string],
    author: string
}

const RecipePage = () => {

    const [recipes,setRecipes] = useState<recipeType[]>([]);

    useEffect(() => {
    const loadData = async () => {
        try{
        const res = await fetch(`/api/recipes`);
        const data = await res.json();
        console.log(data)
        setRecipes(data);
        } catch (err) {
            console.log(err)
        }
    }
    loadData();
    },[])

  return (
    <div id='recipes'>
        {recipes ? Object.values(recipes).map((item) => (<div key={item.id}>
            {item.title}
        </div>)) : "loading.."}
    </div>
  )
}

export default RecipePage