import React, { useState } from 'react'
import type { Item } from '../utils/types'
import type { newFoodFace } from '../utils/types';
import { isExpiredToken } from '../utils/types';
import { useNavigate } from 'react-router-dom';


interface addFoodFormProps{
    onAdd: (item : Item) => void;
    onClose: () => void;
}

const AddFoodItem = ({onAdd,onClose} : addFoodFormProps) => {

    const [newFood,setNewFood] = useState<newFoodFace>({nutrition: [],fcdId: undefined,imageUrl: '',createdAt: new Date(),name: '',foodType: '',wikiUrl: '',author: 'admin',type: "food"});

    const [nutrientInput,setNutrientInput] = useState({name: "",unit: "",value: 0});

    const [readDisplay,setReadDisplay] = useState({display: "block"})

    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const handleFoodSubmit = async(e : React.FormEvent) => {
        e.preventDefault();
        if(newFood?.name.length < 1 || newFood?.foodType.length < 1){
            return;
        }
        if(newFood.nutrition?.length! < 1){
            alert("provide at least 1 nutrient please.")
            return;
        }
        try{
            // check for valid token
        if(token && isExpiredToken(token)){
            alert("expired token please login again.")
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/")
        }
        const res = await fetch("/api/foods",{method: "POST",headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`},body: JSON.stringify(newFood)})
        if(res.ok){
            const addedFood = await res.json();
            onAdd(addedFood);
            console.log("food added.",addedFood)
        } else {
            console.log("failed to add food")
        }
        } catch(err){
            console.log(err)
        } finally {
            setNewFood({nutrition: [],createdAt: new Date(),name: '',fcdId: 0,imageUrl: '',foodType: '',wikiUrl: '',author: '',type: "food"});
            onClose();
        }
    }

    const addNutrient = (e : React.FormEvent) => {
        e.preventDefault();
        if(nutrientInput.name && nutrientInput.unit && nutrientInput.value){
            setNewFood((prev) => ({
                ...prev, nutrition: [...(prev.nutrition || []),nutrientInput]
            }))
        }
        setNutrientInput({name: "",unit: "",value: 0})
    }

    const destroyNutrient = (e: React.FormEvent,nutrientToDestroy : any) => {
        e.preventDefault();
        const newNutrients = newFood.nutrition?.filter((nutrient) => nutrient.name !== nutrientToDestroy.name);
        setNewFood((prev) => ({...prev,nutrition: newNutrients}))
    }


  return (
    <div id='additem' style={readDisplay}>
        <form onSubmit={handleFoodSubmit}>
            <label>New food name:</label>
            <input min={2} value={newFood.name} onChange={(e) => setNewFood(prev => ({...prev,name: e.target.value})) } id='new-food-name'/>
            <label>New food type:</label>
            <input min={2} value={newFood.foodType} onChange={(e) => setNewFood(prev => ({...prev,foodType: e.target.value})) } id='new-food-type'/>
            <label>New url:</label>
            <input value={newFood?.wikiUrl} onChange={(e) => setNewFood(prev => ({...prev,wikiUrl: e.target.value})) } id='new-wikiurl'/>
             <label>New imageUrl:</label>
            <input value={newFood.imageUrl} onChange={(e) => setNewFood(prev => ({...prev,imageUrl: e.target.value})) } id='new-imageurl'/>
            <label>New nutrients:</label>
            <div>
                <input placeholder='Nutrient name (e.g., fat, protein)' value={nutrientInput.name} onChange={(e) => setNutrientInput(prev => ({...prev,name: e.target.value})) } id='new-nutrient-name'/>
                <input placeholder='Value' min={0} value={nutrientInput.value} onChange={(e) => setNutrientInput(prev => ({...prev,value: Number(e.target.value)})) } id='new-nutrient-value'/>
                <input placeholder='Unit (e.g., g, mg)' value={nutrientInput.unit} onChange={(e) => setNutrientInput(prev => ({...prev,unit: e.target.value})) } id='new-nutrient-unit'/>
                <button onClick={(e) =>addNutrient(e)}>Add nutrient +</button>
            </div>
            <label>New fdcId:</label>
            <input type='number' value={newFood.fcdId} onChange={(e) => setNewFood(prev => ({...prev,fcdId: e.target.value === "" ? undefined : Math.max(0,Number(e.target.value))})) } id='new-fdcid'/>
            <button type='submit' >Add new Food ✅</button>
            {<ul>
                {newFood.nutrition?.map((n) => (
                <li key={n.name}>{n.name}: {n.value}{n.unit}
                <button onClick={(e) => destroyNutrient(e,n)}>❌</button>
                </li>
            ))}
            </ul>}
        </form>
        <button onClick={() => setReadDisplay({display: "none"})}>❌</button>
    </div>
  )
}

export default AddFoodItem