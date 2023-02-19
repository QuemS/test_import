import 'https://yandex.st/jquery/1.6.4/jquery.min.js';

import { loadDrivers, loadShops } from './assets/js/api.js'
import { driversListBoxLayoutFn, shopsListBoxLayoutFn, listBoxItemLayoutFn, balloonContentLayoutFn, buildPlacemarkLayout } from './assets/js/layout.js'

let shopsList = [];
let selectedDriver = null;
let driversList = await loadDrivers();
const MAP_CENTER = [40.216666, 44.54883]; // TODO: change to current location
const MAP_DEFAULT_ZOOM = 11;


function getShopPreset(shop) {
    return (shop.status === 'visited') ? 'islands#greenIcon' : 'islands#redIcon';
}

if (driversList.length > 0) {
    selectedDriver = driversList[0];
    console.log(shopsList);
    shopsList = await loadShops(selectedDriver.id);
} else {
    // TODO: add some fallback
}

function drawShops(geoMap, shopList) {
    geoMap.geoObjects.removeAll();

    shopsList.forEach(shop => {
        let coordinates = { latitude: shop.latitude, longitude: shop.longitude }
        let BalloonContentLayout = balloonContentLayoutFn(shop, geoMap, selectedDriver, shopsList, coordinates);

        let placemark = new ymaps.Placemark([shop.latitude, shop.longitude], {
            // iconContent: shop.order,
            hintContent: shop.name,
            shop: shop,
        }, {
            // preset: getShopPreset(shop),
            iconLayout: buildPlacemarkLayout(shop),
            balloonContentLayout: BalloonContentLayout,
            iconShape: {
                type: 'Circle',
                coordinates: [0, 0],
                radius: 25
            },
            hideIconOnBalloonOpen: false
        });
        geoMap.geoObjects.add(placemark);
    });
}

function generateShopListBoxItems(shopList) {
    return shopsList.map(x => new ymaps.control.ListBoxItem({
        data: {
            content: `${x.in_day_order} - ${x.name}`,
            info: x,
            ...x
        }
    }));
}



ymaps.ready(init);


function init() {
    let myMap = new ymaps.Map('map', {
        center: MAP_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        controls: []
    })
    // Creating a custom drop-down list layout.
    let DriversListBoxLayout = driversListBoxLayoutFn();
    let ShopsListBoxLayout = shopsListBoxLayoutFn();

    // Also creating a layout for a separate list item.
    let ListBoxItemLayout = listBoxItemLayoutFn();

    let driversListBoxItems = driversList.map(x => new ymaps.control.ListBoxItem({
        data: {
            content: x.name,
            info: x,
            ...x
        },
        state: {
            selected: x.id === selectedDriver.id
        }
    }));


    // Now we'll create a list containing the two items.
    let driversListBox = new ymaps.control.ListBox({
        items: driversListBoxItems,
        data: {
            title: 'Select a driver'
        },
        options: {
            layout: DriversListBoxLayout,
            itemLayout: ListBoxItemLayout
        }
    });

    let shopsListBox = new ymaps.control.ListBox({
        items: generateShopListBoxItems(shopsList),
        data: {
            title: 'Select a store'
        },
        options: {
            // You can use options to specify the layout directly for the list,
            layout: ShopsListBoxLayout,

            itemLayout: ListBoxItemLayout
        }
    });

    driversListBox.events.add('click', async function (e) {

        var item = e.get('target');
        // A click on the drop-down list title does not need to be processed.

        if (item.data.get('id') !== selectedDriver.id && item !== driversListBox) {
            selectedDriver = item.data.get('info');
            shopsList = await loadShops(item.data.get('id'));

            // clean shops list box
            for (let o in shopsListBox.getIterator()) {
                shopsListBox.remove(o);
            }

            // add new shops
            generateShopListBoxItems(shopsList).forEach(x => shopsListBox.add(x));

            drawShops(myMap, shopsList);
        }

        driversListBox.collapse();
        myMap.setCenter(MAP_CENTER, MAP_DEFAULT_ZOOM);
    });

    shopsListBox.events.add('click', function (e) {

        var item = e.get('target');
        // A click on the drop-down list title does not need to be processed.
        if (item != shopsListBox) {
            myMap.setCenter(
                [item.data.get('latitude'), item.data.get('longitude')],
                18
            );
        }

        shopsListBox.collapse();
    });


    myMap.controls.add(shopsListBox, { float: 'left' });
    myMap.controls.add(driversListBox, { float: 'left' });
    drawShops(myMap, shopsList);


}




