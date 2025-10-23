import React, { useState } from 'react'
import type { Item } from '../utils/types'
import type { foodFace } from '../utils/types';
import { isExpiredToken } from '../utils/types';
import { useNavigate } from 'react-router-dom';


interface EditFormProps {
  itemToDisplay: foodFace;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

const EditFoodItem = ({itemToDisplay,onSave,onCancel} : EditFormProps) => {

    const [editFoodItem,setEditFoodItem] = useState<foodFace>(itemToDisplay);

    const token = localStorage.getItem("token")
    const navigate = useNavigate();


    const handleFoodEdit = async(e : React.FormEvent,id : string) => {
        try{
        e.preventDefault();

        const editedFood = {_id: itemToDisplay?._id,name: editFoodItem?.name,foodType: editFoodItem?.foodType,wikiUrl: editFoodItem?.wikiUrl,author: editFoodItem?.author,imageUrl: editFoodItem.imageUrl,nutrition: editFoodItem.nutrition,fdcId: editFoodItem.fdcId}

        if(token && isExpiredToken(token)){
            alert("expired token please login again.")
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/")
        }
        const res = await fetch(`/api/foods/${id}`,{method: "PUT", headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`},body: JSON.stringify({name: editedFood.name,foodType: editedFood.foodType,wikiUrl: editedFood.wikiUrl, author: editedFood.author,imageUrl: editedFood.imageUrl,nutrition: editedFood.nutrition,fdcId: editedFood.fdcId })})

        if(res.ok){
            const updatedFood = await res.json();
            console.log("updated successfully",updatedFood)
            onSave(updatedFood)
        } else {
            console.log("failed to update food")
        }

        }catch(e){
            console.log(e)
        }
    }

  return (
    <div>
        <form onSubmit={(e) => handleFoodEdit(e,itemToDisplay?._id)}>
            <label>Edit food name :</label>
            <input value={editFoodItem?.name} onChange={(e) => setEditFoodItem((prev) => ({...prev,name: e.target.value}))} id='edit-food-name'/>
            <label>Edit food type :</label>
            <input value={editFoodItem?.foodType} onChange={(e) => setEditFoodItem((prev) => ({...prev,foodType: e.target.value}))} id='edit-food-type'/>
            <label>Edit food url :</label>
            <input value={editFoodItem?.wikiUrl} onChange={(e) => setEditFoodItem((prev) => ({...prev,wikiUrl: e.target.value}))} id='edit-food-url'/>
            <label>Edit food author :</label>
            <input value={editFoodItem?.author} onChange={(e) => setEditFoodItem((prev) => ({...prev,author: e.target.value}))} id='edit-food-author'/>
            <label>Edit food fdcId :</label>
            <input value={editFoodItem?.fdcId} onChange={(e) => setEditFoodItem((prev) => ({...prev,fdcId: Math.max(0,Number(e.target.value))}))} id='edit-food-fdcid'/>
            <label>Edit food imageUrl :</label>
            <input value={editFoodItem?.imageUrl} onChange={(e) => setEditFoodItem((prev) => ({...prev,imageUrl: e.target.value}))} id='edit-food-imageurl'/>
            <label>Edit food nutrition :</label>
            <input value={editFoodItem?.nutrition} onChange={(e) => setEditFoodItem((prev) => ({...prev,imageUrl: e.target.value}))} id='edit-food-nutrition'/>
            <button type='submit' >Confirm Edit 👍</button>
            <button onClick={onCancel}>Cancel X</button>
        </form>
    </div>
  )
}

export default EditFoodItem