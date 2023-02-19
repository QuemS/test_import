const URL = 'http://18.185.247.193'

async function loadDrivers() {

    try {
        let response = await fetch(`${URL}/api/v1/drivers`);
        let json = await response.json();
        return json
    } catch (error) {
        console.log(error);
    }

    // return [{ id: 1, name: "Alex" }, { id: 2, name: "Mike" }];
}

async function loadShops(driverId) {
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

    let sampleShops
    try {
        let response = await fetch(`${URL}/api/v1/drivers`);
        sampleShops = await response.json();
    } catch (error) {
        console.log(error);
    }

    let shops = sampleShops.filter(x => x.driverId === driverId);
    shops.sort((a, b) => a.in_day_order < b.in_day_order);
    return shops;

}

async function changeStoreStatusPost(driverId, shopId, coordinates) {
    let data = {
        driver_id: driverId,
        shop_id: shopId,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,

    }
    try {
        let response = await fetch(`${URL}/api/v1/change_shop_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });

        let result = await response.json();
        console.log(result);
        return true;
    } catch (error) {
        console.log(error);
    }
    // send api call;
    // return TRUE on success

}


export { loadDrivers, loadShops, changeStoreStatusPost }