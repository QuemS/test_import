// loadDrivers() -> [{ id: 1, name: "Alex" }]
// loadShops(driverId) -> [{ id: 1, address: "String", latitude: 54.12313, longitude: 43.232323, name: "Shop1", status: "visited" }]
// changeShopStatus(driverId, shopId)

import 'https://yandex.st/jquery/1.6.4/jquery.min.js';
// import { sentryInit } from './assets/plugins/sentry.js'

import { loadDrivers, loadShops, changeStoreStatus, loadDOWs } from './assets/js/api.js'
import { buildPlacemarkLayout } from './assets/js/placemark.js'
import {
    DriversListBoxLayoutStr,
    ShopsListBoxLayoutStr,
    ListBoxItemLayoutStr,
    generateDriversListBoxLayout,
    generateShopsListBoxLayout,
    generateDOWListBoxLayout
} from './assets/js/layout.js'
// sentryInit();


let shopsList = [];
let selectedDriver = null;
let dowList = await loadDOWs();
let selectedDOW = dowList.filter(x => x.is_current)[0];
let driversList = await loadDrivers();
let CURRENT_POSITION = null;

let MAP_CENTER = [40.186959, 44.514960]; // TODO: change to current location
const MAP_DEFAULT_ZOOM = 13;

let PLACEMARK_RADIUS = 25;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    PLACEMARK_RADIUS = 35;
}

function getCurrentPosition() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        CURRENT_POSITION = [pos.coords.latitude, pos.coords.longitude];
        MAP_CENTER = CURRENT_POSITION;
    }

    function error(err) {
        CURRENT_POSITION = [null, null];
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
}

getCurrentPosition();

function redrawStore(geoMap, shopId) {
    let shop = null;
    for (let i = 0; i < shopsList.length; i++) {
        if (shopsList[i].id === shopId) {
            shop = shopsList[i];
            shop.status = (shop.status === 'visited') ? 'not_visited' : 'visited';
        }
    }

    if (shop === null) {
        // error
    }

    geoMap.geoObjects.each(placemark => {
        if (placemark.properties.get('shop').id === shopId) {
            placemark.properties.set('shop', shop);
            placemark.options.set('iconLayout', buildPlacemarkLayout(shop));
        }
    });
}


if (driversList.length > 0) {
    selectedDriver = driversList[0];
    shopsList = await loadShops(selectedDriver.id, selectedDOW.id);
} else {
    Raven.captureMessage("Empty drivers list.");
}

function drawShops(geoMap, shopList) {
    geoMap.geoObjects.removeAll();

    shopsList.forEach(shop => {
        let BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            `
            <div class='d-flex flex-column ps-1 balloon'>
                    <div class='pb-md-2 pt-md-1 pt-2 mobile-balloon-text line-text'>
                        <strong>${shop.name}</strong>
                    </div>
                    <div class='pb-md-2 mobile-balloon-text line-text'>
                        <strong>Адрес:</strong><span> ${shop.address}</span>
                        
                    </div>
                    <div class='my-1'>
                        <a class="btn btn-success btn-balloon" href="tel: ${shop.phone_number}" role="button">Позвонить</a>
                    </div>
                    <div class='my-1'>
                        <a class="btn btn-warning btn-balloon" href="yandexnavi://build_route_on_map?lat_to=${shop.latitude}&lon_to=${shop.longitude}"
                        role="button">Навигатор</a>
                    </div>
                    <div class='my-1'>
                        <button class="btn btn-danger btn-balloon" id="btn_status_change">Изменить статус</button>
                    </div>
                </div>
                `, {
            build: function () {
                // First, we call the "build" method of the parent class.
                BalloonContentLayout.superclass.build.call(this);
                // Then we perform additional steps.
                $('#btn_status_change').bind('click', this.statusChangeClick);
            },


            clear: function () {
                $('#btn_status_change').unbind('click', this.statusChangeClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            statusChangeClick: function () {
                getCurrentPosition();
                let new_status = (shop.status === 'visited') ? 'not_visited' : 'visited';
                if (changeStoreStatus(selectedDriver.id, shop.id, CURRENT_POSITION, new_status)) {
                    redrawStore(geoMap, shop.id);
                } else {
                    alert('Failed to change status.')
                }

            }
        });

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
                // The circle is defined as the center and radius
                coordinates: [0, 0],
                radius: PLACEMARK_RADIUS
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


function generateDOWListBoxItems(dowList) {
    return dowList.map(x => new ymaps.control.ListBoxItem({
        data: {
            content: `${x.am} - ${x.ru}`,
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


    // Also creating a layout for a separate list item.
    let ListBoxItemLayout = ymaps.templateLayoutFactory.createClass(ListBoxItemLayoutStr);

    let driversListBoxItems = driversList.map(x => new ymaps.control.ListBoxItem({
        data: {
            content: x.full_name,
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
            title: 'Сотрудник'
        },
        options: {

            // You can use options to specify the layout directly for the list,
            layout: generateDriversListBoxLayout(),
            /**
             * or the layout for the child elements of the list. To define options for child
             * elements through the parent element,
             * add the 'item' prefix to option names.
             */
            itemLayout: ListBoxItemLayout
        }
    });

    let dowListBox = new ymaps.control.ListBox({
        items: generateDOWListBoxItems(dowList),
        data: {
            title: 'День недели'
        },
        options: {
            // You can use options to specify the layout directly for the list,
            layout: generateDOWListBoxLayout(),
            /**
             * or the layout for the child elements of the list. To define options for child
             * elements through the parent element,
             * add the 'item' prefix to option names.
             */
            itemLayout: ListBoxItemLayout
        }
    });


    let shopsListBox = new ymaps.control.ListBox({
        items: generateShopListBoxItems(shopsList),
        data: {
            title: 'Магазин'
        },
        options: {
            // You can use options to specify the layout directly for the list,
            layout: generateShopsListBoxLayout(),
            /**
             * or the layout for the child elements of the list. To define options for child
             * elements through the parent element,
             * add the 'item' prefix to option names.
             */
            itemLayout: ListBoxItemLayout
        }
    });

    async function redrawShops() {
        for (let i = 0; i < shopsList.length; i++) {
            shopsListBox.remove(null);
        }

        shopsList = await loadShops(selectedDriver.id, selectedDOW.id);

        // add new shops
        generateShopListBoxItems(shopsList).forEach(x => shopsListBox.add(x));

        drawShops(myMap, shopsList);
    }

    dowListBox.events.add('click', async function (e) {
        var item = e.get('target');

        if (item.data.get('id') !== selectedDOW.id && item !== dowListBox) {
            selectedDOW = item.data.get('info');
            await redrawShops();
        }

        dowListBox.collapse();
    });

    driversListBox.events.add('click', async function (e) {
        /**
         * Getting a reference to the clicked object.
         * List item events propagate and can be
         * listened to on the parent element.
         */
        var item = e.get('target');
        // A click on the drop-down list title does not need to be processed.

        if (item.data.get('id') !== selectedDriver.id && item !== driversListBox) {
            selectedDriver = item.data.get('info')
            await redrawShops();
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

    /// test senrty myUndefinedFunction();
    myMap.controls.add(dowListBox, { float: 'left' });
    myMap.controls.add(shopsListBox, { float: 'left' });
    myMap.controls.add(driversListBox, { float: 'left' });
    drawShops(myMap, shopsList);

    //test error
    getCurrentPosition();
}
