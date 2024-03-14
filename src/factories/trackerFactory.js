import trackerList from '../trackerList.json'
import {LOCAL_STORAGE_ITEM_LIST, LOCAL_STORAGE_TRACKER_LIST} from "../constants";
import {getItemFromWeb} from "./itemFactory";
import LZString from 'lz-string';
import exampleUserItem from "../userItems/exampleUserItem.json"

export async function getAndUpdateTrackerList() {
    let localTrackerList = trackerList;
    let newItemList = [];

    if (localStorage.getItem(LOCAL_STORAGE_TRACKER_LIST)) {
        let persistedTrackerList = LZString.decompressFromUTF16(localStorage.getItem(LOCAL_STORAGE_TRACKER_LIST));
        persistedTrackerList = await JSON.parse(persistedTrackerList);
        localTrackerList = [...new Set([...localTrackerList, ...persistedTrackerList])];
    }

    for (const trackerUrl of localTrackerList) {
        try {
            let response = await fetch(trackerUrl);

            if (!response.ok) {
                console.log(`HTTP error on ${trackerUrl}! status: ${response.status}`);
            } else {
                let retrievedTrackerList = await response.json();
                if (Array.isArray(retrievedTrackerList)) {
                    // Create array of item URLs
                    let itemUrls = retrievedTrackerList;
                    let i,j,temparray, chunk = 10;
                    for (i=0,j=itemUrls.length; i<j; i+=chunk) {
                        temparray = itemUrls.slice(i,i+chunk);
                        // Fetch items in chunks of 10
                        let chunkPromise = temparray.map(itemUrl => getItemFromWeb(itemUrl));
                        let chunkResult = await Promise.all(chunkPromise);
                        newItemList.push(...chunkResult);
                    }
                } else {
                    console.log(`Tracker File ${trackerUrl} is badly formed.`);
                }
            }
        } catch (error) {
            console.log("An error occurred while fetching the JSON file: ", error);
        }
    }

    //add example item to the item list for debugging
    // newItemList.push(exampleUserItem);

    //save the new item list to local storage
    localStorage.setItem(LOCAL_STORAGE_ITEM_LIST, LZString.compressToUTF16(JSON.stringify(newItemList)));

    //save the tracker list to local storage
    localStorage.setItem(LOCAL_STORAGE_TRACKER_LIST, LZString.compressToUTF16(JSON.stringify(localTrackerList)));
}