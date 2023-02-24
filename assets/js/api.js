const URL = 'http://18.185.247.193'
import {getAlert} from "./alerts.js";
import {
    DRIVERS_LOADING_ERROR,
    SHOPS_LOADING_ERROR,
    STATUS_CHANGE_ERROR,
    DOWS_LOADING_ERROR
} from './alertMessages.js'

async function loadDOWs() {
    try {
        let response = await fetch(`${URL}/api/v1/days_of_week`);
        if (!response.ok) {
            throw new Error('Failed to load dow list.');
        }
        return await response.json();
    } catch (error) {
        Raven.captureException(error);
        getAlert(DOWS_LOADING_ERROR, 'danger');
        return [];
    }
}

async function loadDrivers() {
    try {
        let response = await fetch(`${URL}/api/v1/drivers`);
        if (!response.ok) {
            throw new Error('Failed to load drivers list.');
        }
        return await response.json();
    } catch (error) {
        Raven.captureException(error);
        getAlert(DRIVERS_LOADING_ERROR, 'danger');
        return [];
    }
    // return [
    //     {
    //         "email": "admin@shoplist.com",
    //         "is_active": true,
    //         "is_superuser": true,
    //         "full_name": "Alex",
    //         "id": 1
    //     },
    //     {
    //         "email": "Hrant@shoplist.com",
    //         "is_active": true,
    //         "is_superuser": false,
    //         "full_name": "Hrant",
    //         "id": 2
    //     },
    //     {
    //         "email": "David@shoplist.com",
    //         "is_active": true,
    //         "is_superuser": false,
    //         "full_name": "David",
    //         "id": 3
    //     }
    // ];
}

async function loadShops(driverId, dow) {
    // let sampleShops = [
    //     {
    //         id: 1,
    //         driverId: 1,
    //         address: "Yerevan",
    //         latitude: 40.216666,
    //         longitude: 44.548838,
    //         name: "Yerevan-City Carav",
    //         status: "visited",
    //         in_day_order: 1,
    //         phone: "+37441153113",
    //     },
    //     {
    //         id: 2,
    //         driverId: 1,
    //         address: "Yerevan",
    //         latitude: 40.216790,
    //         longitude: 44.551488,
    //         name: "Victoria Carav",
    //         status: "not_visited",
    //         in_day_order: 2,
    //         phone: "+37441153113",
    //     },
    //     {
    //         id: 3,
    //         driverId: 2,
    //         address: "Yerevan",
    //         latitude: 40.206074,
    //         longitude: 44.522248,
    //         name: "Yerevan-City Komitas",
    //         status: "visited",
    //         in_day_order: 1,
    //         phone: "+37441153113",
    //     },
    //     {
    //         id: 4,
    //         driverId: 2,
    //         address: "Yerevan",
    //         latitude: 40.205984,
    //         longitude: 44.517900,
    //         name: "Zovk Komitas",
    //         status: "not_visited",
    //         in_day_order: 2,
    //         phone: "+37441153113",
    //     }
    // ];

    try {
        let response = await fetch(`${URL}/api/v1/drivers/${driverId}/shops?day_of_week=${dow}`);
        if (!response.ok) {
            throw new Error("Failed to load shops list.");
        }
        let shops = await response.json();
        return shops.sort((a, b) => a.in_day_order - b.in_day_order);
    } catch (error) {
        Raven.captureException(error);
        getAlert(SHOPS_LOADING_ERROR, 'danger');
        return [];
    }
}

async function changeStoreStatus(driverId, shopId, coordinate, status) {
    try {
        let data = {
            driver_id: driverId,
            shop_id: shopId,
            latitude: coordinate[0],
            longitude: coordinate[1],
            status: status,

        };
        let response = await fetch(`${URL}/api/v1/change_shop_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to change shop status.');
        }
        // getAlert(messageSuccessStatus, 'success')
        return true;
    } catch (error) {
        Raven.captureException(error);
        getAlert(STATUS_CHANGE_ERROR, 'danger');
        return false;
    }
}


export {loadDrivers, loadShops, changeStoreStatus, loadDOWs}