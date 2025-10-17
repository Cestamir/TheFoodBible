import React, { useState } from 'react'
import type { Item } from '../utils/types'
import type { foodFace } from '../utils/types';

interface EditFormProps {
  itemToDisplay: foodFace;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

const EditFoodItem = ({itemToDisplay,onSave,onCancel} : EditFormProps) => {

    const [editFoodItem,setEditFoodItem] = useState<foodFace>(itemToDisplay);

    const token = localStorage.getItem("token")

    const editFoodItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const changeTarget = e.target.id;
        const value = e.target.value;
        if(changeTarget === "edit-food-title"){
            setEditFoodItem((prev : foodFace) => ({
                ...prev,title: value
            }))
        } else if(changeTarget === "edit-food-type"){
            setEditFoodItem((prev : foodFace) => ({
                ...prev,foodType: value
            }))
        } else if(changeTarget === "edit-food-url"){
            setEditFoodItem((prev : foodFace) => ({
                ...prev,url: value
            }))
        } else if(changeTarget === "edit-food-author"){
            setEditFoodItem((prev : foodFace) => ({
                ...prev,author: value
            }))
        }
    }

    const handleFoodEdit = async(e : React.FormEvent,id : string) => {
        try{
        e.preventDefault();

        const editedFood = {_id: itemToDisplay?._id,title: editFoodItem?.title,foodType: editFoodItem?.foodType,url: editFoodItem?.url,author: editFoodItem?.author}

        const res = await fetch(`/api/foods/${id}`,{method: "PUT", headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`},body: JSON.stringify({title: editedFood.title,foodType: editedFood.foodType,url: editedFood.url, author: editedFood.author})})

        if(res.ok){
            const updatedFood = await res.json();
            console.log("updated successfully",updatedFood)
            onSave(updatedFood)
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
            <button onClick={onCancel}>Cancel X</button>
        </form>
    </div>
  )
}

export default EditFoodItem