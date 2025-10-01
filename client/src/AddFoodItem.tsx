import React, { useState } from 'react'

interface newFoodFace {
    title: string,
    url: string,
    foodType: string,
    author: string
}

const AddFoodItem = () => {

    const [newFood,setNewFood] = useState<newFoodFace>({title: '',foodType: '',url: '',author: ''});

    const [readDisplay,setReadDisplay] = useState({display: "block"})

    const handleFoodSubmit = async(e : React.FormEvent) => {
        if(newFood?.title.length < 1 || newFood?.foodType.length < 1){
            return;
        }
        try{
        e.preventDefault();
        const res = await fetch("/api/foods",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(newFood)})
        if(res.ok){
            const addedFood = await res.json();
            console.log(addedFood)
        } else {
            console.log("failed to add food")
        }
        } catch(err){
            console.log(err)
        } finally {
            console.log("done")
            setNewFood({title: '',foodType: '',url: '',author: ''})
        }
    }

    const newFoodChange = (e : any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "new-food-title"){
            setNewFood((prev) => ({
                ...prev,title: value
            }))
        } else if(changeTarget === "new-food-type"){
            setNewFood((prev) => ({
                ...prev,foodType: value
            }))
        } else if(changeTarget === "new-food-url"){
            setNewFood((prev) => ({
                ...prev,url: value
            }))
        } else if(changeTarget === "new-food-author"){
            setNewFood((prev) => ({
                ...prev,author: value
            }))
        }
    }


  return (
    <div id='additem' style={readDisplay}>
        <form onSubmit={handleFoodSubmit}>
            <label>New food name:</label>
            <input value={newFood?.title} onChange={newFoodChange} id='new-food-title'/>
            <label>New food type:</label>
            <input value={newFood?.foodType} onChange={newFoodChange} id='new-food-type'/>
            <label>New url name:</label>
            <input value={newFood?.url} onChange={newFoodChange} id='new-food-url'/>
             <label>New author name:</label>
            <input value={newFood?.author} onChange={newFoodChange} id='new-food-author'/>
            <button type='submit' >Add Food ✅</button>
        </form>
        <button onClick={() => setReadDisplay({display: "none"})}>❌</button>
    </div>
  )
}

export default AddFoodItem