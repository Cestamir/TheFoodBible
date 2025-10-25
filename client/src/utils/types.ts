

export type Item = recipeFace | foodFace 

export function isFoodItem(item: Item): item is foodFace {
    return item.type === 'food';
}

export function isRecipeItem(item: Item): item is recipeFace {
    return item.type === 'recipe';
}

export const isExpiredToken = (token: string) => {
    try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 < Date.now();
        
    } catch {
        return true;
    }
}

export interface Diet{
    _id?: string,
    planName: string,
    duration: number,
    goal: string,
}

export interface User {
    _id?: string,
    userName: string,
    password?: string,
    userEmail: string,
    role: string,
}

export interface newRecipeFace {
    type: "recipe"
    diet: string[],
    name: string,
    instructions: string,
    ingredients: string[],
    url: string
    imageUrl: string
    cookTime: string
    author: string
    createdAt: Date
}

export interface newFoodFace {
    type: "food"
    name: string,
    fcdId?: number;
    wikiUrl: string,
    nutrition?: Nutrient[],
    imageUrl?: string,
    foodType: string,
    author: string
    createdAt: Date
}

export interface recipeFace {
    _id: string,
    type: "recipe"
    diet: string[],
    name: string,
    instructions: string,
    ingredients: string[],
    url: string
    imageUrl: string
    cookTime: string
    author: string
    createdAt: Date
}

export interface Nutrient{
    name: string,
    value: number,
    unit: string,
}

export interface foodFace {
    type: "food",
    _id: string,
    name: string,
    wikiUrl: string,
    imageUrl?: string,
    nutrition?: Nutrient[],
    fdcId?: number,
    foodType: string,
    author?: string
    createdAt: Date
}