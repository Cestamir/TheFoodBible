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

    const [editNutrientInput,setEditNutrientInput] = useState({name: "",value: 0,unit: ""});
    
    const [editNutrientClicked,setEditNutrientClicked] = useState(false);
    const [addNewNutrientClicked,setAddNewNutrientClicked] = useState(false);

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
            navigate("/login")
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

    const editNutrient = (e: React.FormEvent) => {
        e.preventDefault();
        setEditFoodItem((prev) => ({...prev,nutrition: [...(prev.nutrition || []),editNutrientInput]}))
        setEditNutrientClicked(false)
        setEditNutrientInput({name: "",value: 0,unit: ""});
    }

    const updateNutrient = (nutrient: any,e: React.FormEvent) => {
        e.preventDefault();
        setEditNutrientClicked(true);
        setEditNutrientInput(nutrient);
        const beforeEditNutrients = editFoodItem.nutrition?.filter((nut) => nut.name !== nutrient.name);
        setEditFoodItem((prev) => ({...prev,nutrition: beforeEditNutrients}));

    }

    const addNutrientToFood = (e: React.FormEvent) => {
        e.preventDefault();
        setEditFoodItem((prev) => ({...prev,nutrition: [...(prev.nutrition || []),editNutrientInput]}));
        setAddNewNutrientClicked(false);
        setEditNutrientInput({name: "",value: 0,unit: ""});
    }

    const addNewNutrient = (e: React.FormEvent) => {
        e.preventDefault();
        setAddNewNutrientClicked(true);
    }

    const handleNutrientDelete = (nutrient: any,e: React.FormEvent) => {
        e.preventDefault();
        const newNutrients = editFoodItem.nutrition?.filter((nut) => nut.name !== nutrient.name);
        setEditFoodItem((prev) => ({...prev,nutrition: newNutrients}));
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
            <div id='edit-food-nutrition' style={{width: "200px",height: "200px",overflowY: "scroll"}}>
                <button onClick={(e) => addNewNutrient(e)}>Add new nutrient</button>
                {/* add new nutrient */}
                {addNewNutrientClicked && <div>
                    <input min={1} value={editNutrientInput.name} onChange={(e) => setEditNutrientInput(prev => ({...prev,name: e.target.value})) } id='add-nutrient-name'/>
                    <input type='number' value={editNutrientInput.value} onChange={(e) => setEditNutrientInput(prev => ({...prev,value: Math.max(0,Number(e.target.value))})) } id='add-nutrient-value'/>
                    <input min={1} value={editNutrientInput.unit} onChange={(e) => setEditNutrientInput(prev => ({...prev,unit: e.target.value})) } id='add-nutrient-unit'/>
                    <button onClick={(e) =>addNutrientToFood(e)}>Add +</button> 
                    <button onClick={(e) => {
                        e.preventDefault();
                        setAddNewNutrientClicked(false);
                        setEditNutrientInput({name: "",value: 0,unit: ""});
                    }}>Cancel</button>                   
                    </div>}
                {/* edit existing nutrient */}
                {editNutrientClicked && <div>
                    <input  value={editNutrientInput.name} onChange={(e) => setEditNutrientInput(prev => ({...prev,name: e.target.value})) } id='edit-nutrient-name'/>
                    <input type='number' value={editNutrientInput.value} onChange={(e) => setEditNutrientInput(prev => ({...prev,value: Math.max(0,Number(e.target.value))})) } id='edit-nutrient-value'/>
                    <input value={editNutrientInput.unit} onChange={(e) => setEditNutrientInput(prev => ({...prev,unit: e.target.value})) } id='edit-nutrient-unit'/>
                    <button onClick={(e) =>editNutrient(e)}>Confirm Edit</button> 
                    <button onClick={(e) => {
                        e.preventDefault();
                        setEditNutrientClicked(false);
                        setEditFoodItem((prev) => ({...prev,nutrition: [...(prev.nutrition || []),editNutrientInput]}));
                        setEditNutrientInput({name: "",value: 0,unit: ""});
                    }}>Cancel edit</button>
                    </div>}
                <ul>
                    {editFoodItem.nutrition?.map((nut,i) => (
                        <li key={i}>
                            {nut.name} {nut.value}{nut.unit}
                            <button onClick={(e) => updateNutrient(nut,e)}>Edit</button>
                            <button onClick={(e) => handleNutrientDelete(nut,e)}>Destroy!!</button>
                        </li>
                    ))}
                </ul>
            </div>
            <button type='submit' >Confirm Edit 👍</button>
            <button onClick={onCancel}>Cancel X</button>
        </form>
    </div>
  )
}

export default EditFoodItem