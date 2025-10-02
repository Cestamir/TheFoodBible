import type { foodFace, recipeFace } from "./LandingPage";
import type { Item } from "./ReadItem";

export function isFoodItem(item: Item): item is foodFace {
    return item.type === 'food';
}

export function isRecipeItem(item: Item): item is recipeFace {
    return item.type === 'recipe';
}