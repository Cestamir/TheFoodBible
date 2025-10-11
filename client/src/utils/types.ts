

export type Item = recipeFace | foodFace 

export function isFoodItem(item: Item): item is foodFace {
    return item.type === 'food';
}

export function isRecipeItem(item: Item): item is recipeFace {
    return item.type === 'recipe';
}

export interface newRecipeFace {
    type: "recipe"
    title: string,
    instructions: string,
    ingredients: string[],
    url: string
    image: string
    cookTime: string
    author: string
}

export interface newFoodFace {
    type: "food"
    title: string,
    url: string,
    foodType: string,
    author: string
}

export interface recipeFace {
    type: "recipe",
    _id: string,
    title: string,
    instructions: string,
    ingredients: string[],
    author: string
    cookTime: string
    url: string
    image: string
    createdAt: Date
}

export interface foodFace {
    type: "food",
    _id: string,
    title: string,
    url: string,
    foodType: string,
    author: string
    createdAt: Date
}