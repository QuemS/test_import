// loadDrivers() -> [{ id: 1, name: "Alex" }]
// loadShops(driverId) -> [{ id: 1, address: "String", latitude: 54.12313, longitude: 43.232323, name: "Shop1", status: "visited" }]
// changeShopStatus(driverId, shopId)

import 'https://yandex.st/jquery/1.6.4/jquery.min.js';
// import { DriversListBoxLayout, ShopsListBoxLayout, ListBoxItemLayout } from './layout.js'



function loadDrivers() {
    return [{ id: 1, name: "Alex" }, { id: 2, name: "Mike" }];
}

function buildPlacemarkLayout(shop) {
    let placemark_class = (shop.status === 'visited') ? 'visited_circle_layout' : 'not_visited_circle_layout';
    return ymaps.templateLayoutFactory.createClass(`
        <div class="placemark_layout_container">
            <div class=" circle_layout ${placemark_class}">
                <div>${shop.order}</div>
                
            </div>
        </div>
    `);
}

function getShopPreset(shop) {
    return (shop.status === 'visited') ? 'islands#greenIcon' : 'islands#redIcon';
}

function changeStoreStatus(geoMap, driverId, shopId) {
    // TODO: send api call
    // if success:
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


function loadShops(driverId) {
    let sampleShops = [
        {
            id: 1,
            driverId: 1,
            address: "Yerevan",
            latitude: 40.216666,
            longitude: 44.548838,
            name: "Yerevan-City Carav",
            status: "visited",
            order: 1,
            phone: +37441153113,
        },
        {
            id: 2,
            driverId: 1,
            address: "Yerevan",
            latitude: 40.216790,
            longitude: 44.551488,
            name: "Victoria Carav",
            status: "not_visited",
            order: 2,
            phone: +37441153113,
        },
        {
            id: 3,
            driverId: 2,
            address: "Yerevan",
            latitude: 40.206074,
            longitude: 44.522248,
            name: "Yerevan-City Komitas",
            status: "visited",
            order: 1,
            phone: +37441153113,
        },
        {
            id: 4,
            driverId: 2,
            address: "Yerevan",
            latitude: 40.205984,
            longitude: 44.517900,
            name: "Zovk Komitas",
            status: "not_visited",
            order: 2,
            phone: +37441153113,
        }
    ];
    let shops = sampleShops.filter(x => x.driverId === driverId);
    shops.sort((a, b) => a.order < b.order);
    return shops;

}

let driversList = loadDrivers();

let shopsList = [];
let selectedDriver = null;

if (driversList.length > 0) {
    selectedDriver = driversList[0];
    shopsList = loadShops(selectedDriver.id);
} else {
    // TODO: add some fallback
}

function drawShops(geoMap, shopList) {
    geoMap.geoObjects.removeAll();

    shopsList.forEach(shop => {
        let BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            `
                <div class='d-flex flex-column'>
                    <div >
                        <strong>${shop.name}</strong>
                    </div>
                    <div>
                        <strong>Address: ${shop.address}</strong>
                    </div>

                    <div class='my-1'>
                        <a class="btn btn-success btn-balloon" href="tel: ${shop.phone}" role="button">Позвонить</a>
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

            /**
             * Redefining the "build" function in order to start listening to the "click" event
             * on a counter button when creating the layout.
             */
            build: function () {
                // First, we call the "build" method of the parent class.
                BalloonContentLayout.superclass.build.call(this);
                // Then we perform additional steps.
                $('#btn_status_change').bind('click', this.statusChangeClick);
            },

            /**
             * In the same way, we redefine the "clear" function in order to
             * remove listening for clicks when the layout is deleted from the map.
             */
            clear: function () {
                /**
                 * We perform the steps in reverse order - first remove the listener,
                 * and then call the "clear" method of the parent class.
                 */
                $('#btn_status_change').unbind('click', this.statusChangeClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            statusChangeClick: function () {
                changeStoreStatus(geoMap, selectedDriver.id, shop.id);
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
            content: `${x.order} - ${x.name}`,
            info: x,
            ...x
        }
    }));
}

const MAP_CENTER = [40.216666, 44.54883]; // TODO: change to current location
const MAP_DEFAULT_ZOOM = 11;


ymaps.ready(init);


function init() {
    let myMap = new ymaps.Map('map', {
        center: MAP_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        controls: []
    })

    // Creating a custom drop-down list layout.
    let DriversListBoxLayout = ymaps.templateLayoutFactory.createClass(
        "<button id='drivers-listbox-header ' class='btn btn-xl btn-success dropdown-toggle' data-toggle='dropdown'>" +
        "{{data.title}} <span class='caret'></span>" +
        "</button>" +
        /**
         * This element will serve as a container for list items.
         * Depending on whether the list is expanded or collapsed, this container will be
         * hidden or shown together with its child elements.
         */
        "<ul id='drivers-listbox'" +
        " class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'" +
        " style='display: {% if state.expanded %}block{% else %}none{% endif %};'></ul>", {

        build: function () {
            /**
             * Calling the build method of the parent class before
             * performing additional actions.
             */
            DriversListBoxLayout.superclass.build.call(this);

            this.childContainerElement = $('#drivers-listbox').get(0);
            /**
             * Generating a special event that notifies the control
             * of changes to the child element container.
             */
            this.events.fire('childcontainerchange', {
                newChildContainerElement: this.childContainerElement,
                oldChildContainerElement: null
            });
        },

        /**
         * Overriding the interface method that returns a reference
         * to the child element container.
         */
        getChildContainerElement: function () {
            return this.childContainerElement;
        },

        clear: function () {
            /**
             * Forcing the control to remove child elements from the parent
             * before cleaning the layout.
             * This will protect us from unexpected errors associated
             * with the destruction of DOM elements in earlier versions of IE.
             */
            this.events.fire('childcontainerchange', {
                newChildContainerElement: null,
                oldChildContainerElement: this.childContainerElement
            });
            this.childContainerElement = null;
            /**
             * Calling the "clear" method of the parent class
             * after performing additional actions.
             */
            DriversListBoxLayout.superclass.clear.call(this);
        }
    });

    let ShopsListBoxLayout = ymaps.templateLayoutFactory.createClass(
        "<button id='shops-listbox-header' class='btn btn-xl btn-success dropdown-toggle' data-toggle='dropdown'>" +
        "{{data.title}} <span class='caret'></span>" +
        "</button>" +
        /**
         * This element will serve as a container for list items.
         * Depending on whether the list is expanded or collapsed, this container will be
         * hidden or shown together with its child elements.
         */
        "<ul id='shops-listbox'" +
        " class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'" +
        " style='display: {% if state.expanded %}block{% else %}none{% endif %};'></ul>", {

        build: function () {
            /**
             * Calling the build method of the parent class before
             * performing additional actions.
             */
            ShopsListBoxLayout.superclass.build.call(this);

            this.childContainerElement = $('#shops-listbox').get(0);
            /**
             * Generating a special event that notifies the control
             * of changes to the child element container.
             */
            this.events.fire('childcontainerchange', {
                newChildContainerElement: this.childContainerElement,
                oldChildContainerElement: null
            });
        },

        /**
         * Overriding the interface method that returns a reference
         * to the child element container.
         */
        getChildContainerElement: function () {
            return this.childContainerElement;
        },

        clear: function () {
            /**
             * Forcing the control to remove child elements from the parent
             * before cleaning the layout.
             * This will protect us from unexpected errors associated
             * with the destruction of DOM elements in earlier versions of IE.
             */
            this.events.fire('childcontainerchange', {
                newChildContainerElement: null,
                oldChildContainerElement: this.childContainerElement
            });
            this.childContainerElement = null;
            /**
             * Calling the "clear" method of the parent class
             * after performing additional actions.
             */
            ShopsListBoxLayout.superclass.clear.call(this);
        }
    });


    // Also creating a layout for a separate list item.
    let ListBoxItemLayout = ymaps.templateLayoutFactory.createClass(
        "<li class='py-2 drop-hover px-2 list-drop'><a>{{data.content}}</a></li>"
    );

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

            // You can use options to specify the layout directly for the list,
            layout: DriversListBoxLayout,
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
            title: 'Select a store'
        },
        options: {
            // You can use options to specify the layout directly for the list,
            layout: ShopsListBoxLayout,
            /**
             * or the layout for the child elements of the list. To define options for child
             * elements through the parent element,
             * add the 'item' prefix to option names.
             */
            itemLayout: ListBoxItemLayout
        }
    });

    driversListBox.events.add('click', function (e) {
        /**
         * Getting a reference to the clicked object.
         * List item events propagate and can be
         * listened to on the parent element.
         */
        var item = e.get('target');
        // A click on the drop-down list title does not need to be processed.

        if (item.data.get('id') !== selectedDriver.id && item !== driversListBox) {
            selectedDriver = item.data.get('info');
            shopsList = loadShops(item.data.get('id'));

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
        /**
         * Getting a reference to the clicked object.
         * List item events propagate and can be
         * listened to on the parent element.
         */
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




