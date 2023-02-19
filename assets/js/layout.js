import { changeStoreStatusPost } from './api.js'
function buildPlacemarkLayout(shop) {
    let placemark_class = (shop.status === 'visited') ? 'visited_circle_layout' : 'not_visited_circle_layout';
    return ymaps.templateLayoutFactory.createClass(
        `
        <div class="placemark_layout_container">
            <div class=" circle_layout ${placemark_class}">
                <div>${shop.in_day_order}</div>
                
            </div>
        </div>
    `);
};

import 'https://yandex.st/jquery/1.6.4/jquery.min.js';
let DriversListBoxLayoutStr = "<button id='drivers-listbox-header ' class='btn btn-xl btn-success dropdown-toggle' data-toggle='dropdown'>" +
    "{{data.title}} <span class='caret'></span>" +
    "</button>" +
    "<ul id='drivers-listbox'" +
    " class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'" +
    " style='display: {% if state.expanded %}block{% else %}none{% endif %};'></ul>";


let ShopsListBoxLayoutStr = "<button id='shops-listbox-header' class='btn btn-xl btn-success dropdown-toggle' data-toggle='dropdown'>" +
    "{{data.title}} <span class='caret'></span>" +
    "</button>" +
    /**
     * This element will serve as a container for list items.
     * Depending on whether the list is expanded or collapsed, this container will be
     * hidden or shown together with its child elements.
     */
    "<ul id='shops-listbox'" +
    " class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'" +
    " style='display: {% if state.expanded %}block{% else %}none{% endif %};'></ul>";


let ListBoxItemLayoutStr = "<li class='py-2 drop-hover px-2 list-drop'><a>{{data.content}}</a></li>";

function driversListBoxLayoutFn() {
    return ymaps.templateLayoutFactory.createClass(DriversListBoxLayoutStr,
        {
            build: function () {

                driversListBoxLayoutFn().superclass.build.call(this);

                this.childContainerElement = $('#drivers-listbox').get(0);

                this.events.fire('childcontainerchange', {
                    newChildContainerElement: this.childContainerElement,
                    oldChildContainerElement: null
                });
            },


            getChildContainerElement: function () {
                return this.childContainerElement;
            },

            clear: function () {

                this.events.fire('childcontainerchange', {
                    newChildContainerElement: null,
                    oldChildContainerElement: this.childContainerElement
                });
                this.childContainerElement = null;

                driversListBoxLayoutFn().superclass.clear.call(this);
            }
        });
}
function shopsListBoxLayoutFn() {
    return ymaps.templateLayoutFactory.createClass(ShopsListBoxLayoutStr, {
        build: function () {
            shopsListBoxLayoutFn().superclass.build.call(this);

            this.childContainerElement = $('#shops-listbox').get(0);

            this.events.fire('childcontainerchange', {
                newChildContainerElement: this.childContainerElement,
                oldChildContainerElement: null
            });
        },

        getChildContainerElement: function () {
            return this.childContainerElement;
        },

        clear: function () {

            this.events.fire('childcontainerchange', {
                newChildContainerElement: null,
                oldChildContainerElement: this.childContainerElement
            });
            this.childContainerElement = null;

            shopsListBoxLayoutFn().superclass.clear.call(this);
        }
    });
}
function listBoxItemLayoutFn() {
    return ymaps.templateLayoutFactory.createClass(ListBoxItemLayoutStr);
}


function balloonContentLayoutFn(shop, geoMap, selectedDriver, shopsList, coordinates) {
    return ymaps.templateLayoutFactory.createClass(
        `
            <div class='d-flex flex-column ps-1 balloon'>
                <div class='pb-1'>
                    <strong>${shop.name}</strong>
                </div>
                <div class='pb-2'>
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
            </div>`, {
        build: function () {
            // First, we call the "build" method of the parent class.
            balloonContentLayoutFn(shop).superclass.build.call(this);
            // Then we perform additional steps.
            $('#btn_status_change').bind('click', this.statusChangeClick);
        },


        clear: function () {
            $('#btn_status_change').unbind('click', this.statusChangeClick);
            balloonContentLayoutFn(shop).superclass.clear.call(this);
        },

        statusChangeClick: function () {
            changeStoreStatus(geoMap, selectedDriver.id, shop.id, shopsList, coordinates);
        }
    });
}

async function changeStoreStatus(geoMap, driverId, shopId, shopsList, coordinates) {
    console.log('post', await changeStoreStatusPost(driverId, shopId, coordinates));

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





export { driversListBoxLayoutFn, shopsListBoxLayoutFn, listBoxItemLayoutFn, balloonContentLayoutFn, buildPlacemarkLayout }