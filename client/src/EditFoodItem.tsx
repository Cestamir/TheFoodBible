import React, { useState } from 'react'

interface newFoodFace {
    title: string,
    url: string,
    foodType: string,
    author: string
}

const EditFoodItem = ({itemToDisplay} : any) => {

    const [editFoodItem,setEditFoodItem] = useState<newFoodFace>(itemToDisplay);

    const editFoodItemChange = (e: any) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "edit-food-title"){
            setEditFoodItem((prev) => ({
                ...prev,title: value
            }))
        } else if(changeTarget === "edit-food-type"){
            setEditFoodItem((prev) => ({
                ...prev,foodType: value
            }))
        } else if(changeTarget === "edit-food-url"){
            setEditFoodItem((prev) => ({
                ...prev,url: value
            }))
        } else if(changeTarget === "edit-food-author"){
            setEditFoodItem((prev) => ({
                ...prev,author: value
            }))
        }
    }

    const handleFoodEdit = async(e : React.FormEvent,id : any) => {
        try{
        e.preventDefault();

        const editedFood = {_id: itemToDisplay?._id,title: editFoodItem?.title,foodType: editFoodItem?.foodType,url: editFoodItem?.url,author: editFoodItem?.author}

        const res = await fetch(`/api/foods/${id}`,{method: "PUT", headers: {"Content-Type" : "application/json"},body: JSON.stringify({title: editedFood.title,foodType: editedFood.foodType,url: editedFood.url, author: editedFood.author})})

        if(res.ok){
            const updatedFood = await res.json();
            console.log("updated successfully",updatedFood)
        } else {
            console.log("failed to update food")
        }

        }catch(e){
            console.log(e)
        }finally{
            console.log("done")
        }
    }

  return (
    <div>
        <form onSubmit={(e) => handleFoodEdit(e,itemToDisplay?._id)}>
            <label>Edit food title :</label>
            <input value={editFoodItem?.title} onChange={editFoodItemChange} id='edit-food-title'/>
            <label>Edit food type :</label>
            <input value={editFoodItem?.foodType} onChange={editFoodItemChange} id='edit-food-type'/>
            <label>Edit food url :</label>
            <input value={editFoodItem?.url} onChange={editFoodItemChange} id='edit-food-url'/>
            <label>Edit food author :</label>
            <input value={editFoodItem?.author} onChange={editFoodItemChange} id='edit-food-author'/>
            <button type='submit' >Confirm Edit 👍</button>
        </form>
    </div>
  )
}

export default EditFoodItem