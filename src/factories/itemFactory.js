import {LOCAL_STORAGE_ITEM_LIST} from "../constants";
import LZString from 'lz-string';

export async function getItemsFromWeb(itemUrl) {
    let urls = Array.isArray(itemUrl) ? itemUrl : [itemUrl];

    let responses = [];

    for (let url of urls) {
        try {
            let response = await fetch(url);
            if (response.ok) {
                responses.push(await response.json());
            } else {
                console.log(`HTTP error on ${url}! status: ${response.status}`);
            }
        } catch (error) {
            console.log(`An error occurred while fetching the Item file ${url}: `, error);
        }
    }

    return responses;
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