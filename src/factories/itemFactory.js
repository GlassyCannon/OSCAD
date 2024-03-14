import {LOCAL_STORAGE_ITEM_LIST} from "../constants";
import LZString from 'lz-string';

export async function getItemFromWeb(itemUrl) {
    try {
        let response = await fetch(itemUrl);

        if (!response.ok) {
            console.log(`HTTP error on ${itemUrl}! status: ${response.status}`);
        } else {
            return await response.json();
        }
    } catch (error) {
        console.log(`An error occurred while fetching the Item file ${itemUrl}: ` , error);
    }
}

export async function getAllItemsFromLocalStorage() {
    let localItems = [];
    //get the items from local storage, check if they exist
    if (localStorage.getItem(LOCAL_STORAGE_ITEM_LIST)) {
        let localStorageItems = LZString.decompressFromUTF16(localStorage.getItem(LOCAL_STORAGE_ITEM_LIST));
        localItems = await JSON.parse(localStorageItems);
    }

    return localItems;
}

export async function getItemFromLocalStorage(itemAuthor, itemName) {
    const allItems = await getAllItemsFromLocalStorage();
    return allItems.find(item => item.author === itemAuthor && item.title === itemName);
}