import trackerList from '../trackerList.json'
import {LOCAL_STORAGE_ITEM_LIST, LOCAL_STORAGE_TRACKER_LIST} from "../constants";
import {getItem, getItemFromWeb} from "./itemFactory";
import exampleUserItem from "../userItems/exampleUserItem.json"

export async function getAndUpdateTrackerList() {
    let localTrackerList = trackerList;
    let newItemList = [];

    if (localStorage.getItem(LOCAL_STORAGE_TRACKER_LIST)) {
        let persistedTrackerList = localStorage.getItem(LOCAL_STORAGE_TRACKER_LIST);
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
                    for (const itemUrl of retrievedTrackerList) {
                        newItemList.push(await getItemFromWeb(itemUrl));
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
    localStorage.setItem(LOCAL_STORAGE_ITEM_LIST, JSON.stringify(newItemList));

    //save the tracker list to local storage
    localStorage.setItem(LOCAL_STORAGE_TRACKER_LIST, JSON.stringify(localTrackerList));
}