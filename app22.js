function loadDrivers() {
    return [{id: 1, name: "Alex"}, {id: 2, name: "Mike"}];
}

function loadShops(driverId) {
    sampleShops = [
        {driverId: 1, address: "String", latitude: 54.12313, longitude: 43.232323, name: "Shop1", status: "visited"},
        {
            driverId: 1,
            address: "String",
            latitude: 54.12313,
            longitude: 43.432323,
            name: "Shop2",
            status: "not_visited"
        },
        {driverId: 2, address: "String", latitude: 54.12313, longitude: 43.232323, name: "Shop3", status: "visited"},
        {driverId: 2, address: "String", latitude: 54.12313, longitude: 43.432323, name: "Shop4", status: "not_visited"}
    ];
    return sampleShops.filter(x => x.driverId === driverId);
}

ymaps.ready(init);

function init() {
    let map = new ymaps.Map('map', {
        center: [55.751574, 37.573856],
        zoom: 9,
        controls: []
    })

    // Пример 1.
    // Обработка нажатия на элементы списка.
    var cityList = new ymaps.control.ListBox({
        data: {
            content: 'Выберите город'
        },
        items: [
            new ymaps.control.ListBoxItem('Москва'),
            new ymaps.control.ListBoxItem('Новосибирск'),
            new ymaps.control.ListBoxItem({options: {type: 'separator'}}),
            new ymaps.control.ListBoxItem('Нью-Йорк'),
        ]
    });
    cityList.get(0).events.add('click', function () {
        map.setCenter([55.752736, 37.606815]);
    });
    cityList.get(1).events.add('click', function () {
        map.setCenter([55.026366, 82.907803]);
    });
    cityList.get(3).events.add('click', function () {
        map.setCenter([40.695537, -73.97552]);
    });
    map.controls.add(cityList, {floatIndex: 0});


    // Пример 2
    // Создание пользовательского списка.
    //  В этом примере используется jQuery, загруженный из http://yandex.st/jquery/1.6.4/jquery.min.js

    // По умолчанию раскрывающийся список реагирует на событие" click " и автоматически
    // изменяет свое состояние на расширенное или свернутое.
    var MyListBoxLayout = ymaps.templateLayoutFactory.createClass(
            '<div id="my-listbox-header" >{{ data.title }}</div >' +
            // Этот элемент будет служить контейнером для дочерних элементов списка.
            '<div id="my-list-box" style="display: {% if state.expanded %}block{% else %}none{% endif %};" >' +
            '</div >', {

                build: function () {
                    MyListBoxLayout.superclass.build.call(this);
                    this.childContainerElement = $('#my-list-box').get(0);
                    // Каждый раз, когда мы перестраиваемся, мы генерируем событие
                    // это означает, что контейнер для дочерних элементов изменился.
                    // Формат события описан в интерфейсе IGroupControlLayout.
                    this.events.fire('childcontainerchange', {
                        newChildContainerElement: this.childContainerElement,
                        oldChildContainerElement: null
                    });
                },

                // Переопределим метод, который требует интерфейс IGroupControlLayout.
                getChildContainerElement: function () {
                    return this.childContainerElement;
                }
            }
        ),
        // Создадим список и выставим созданный макет через опции.
        listBox = new ymaps.control.ListBox({options: {layout: MyListBoxLayout}});

    // Пример 3.
    // Использование элемента управления ListBox в качестве фильтра
    // для отображения объектов на карте (поддерживается мультивыбор).
    // Объекты добавляются на карту с помощью ObjectManager.

    // Создание выпадающего списка с 5 элементами.
    var listBoxItems = ['Школа', 'Аптека', 'Магазин', 'Больница', 'Бар']
        .map(function (title) {
            return new ymaps.control.ListBoxItem({
                data: {
                    content: title
                },
                state: {
                    selected: true
                }
            });
        });

    // Теперь создаем выпадающий список из 5 пунктов.
    var listBoxControl = new ymaps.control.ListBox({
        data: {
            content: 'Filter',
            title: 'Filter'
        },
        items: listBoxItems,
        state: {
            // Указывает, что список расширен.
            expanded: true,
            filters: listBoxItems.reduce(function (filters, filter) {
                filters[filter.data.get('content')] = filter.isSelected();
                return filters;
            }, {})
        }
    });

    map.controls.add(listBoxControl);

    // Добавление отслеживания к индикатору для проверки того, выбран ли элемент списка.
    listBoxControl.events.add(['select', 'deselect'], function (e) {
        var listBoxItem = e.get('target');
        var filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
        filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
        listBoxControl.state.set('filters', filters);
    });

    // Отслеживание изменений в элементе управления.список.государственное поле.
    var filterMonitor = new ymaps.Monitor(listBoxControl.state);
    var objectManager = new ymaps.ObjectManager();

    filterMonitor.add('filters', function (filters) {
        // Применение фильтра к ObjectManager.
        objectManager.setFilter(getFilterFunction(filters));
    });

    function getFilterFunction(categories) {

        console.log(categories);
        return function (obj) {
            var content = obj.properties.balloonContent;
            return categories[content]
        }
    }


}


// // Пример 1.
// // Обработка нажатия на элементы списка.
// function init() {
//   let map = new ymaps.Map('map', {
//     center: [55.751574, 37.573856],
//     zoom: 9,
//     controls: []
//   })


//   // Пример 1.
//   // Обработка нажатия на элементы списка.

//   var listStoreItems = loadShops()
//     .map(function (title) {
//       return new ymaps.control.ListBoxItem({
//         data: {
//           content: title.name,
//           id: title.idDriver
//         },
//         state: {
//           selected: false
//         }
//       });
//     });

//   // Теперь создаем выпадающий список из 5 пунктов.
//   var listBoxStoreControl = new ymaps.control.ListBox({
//     data: {
//       content: 'Store',
//       title: 'Store'
//     },
//     items: listStoreItems,
//     state: {
//       // Указывает, что список расширен.
//       expanded: false,
//       filters: listStoreItems.filter(item => console.log(item))
//     }
//   });

//   map.controls.add(listBoxStoreControl);


//   // Пример 2
//   // Создание пользовательского списка.
//   //  В этом примере используется jQuery, загруженный из http://yandex.st/jquery/1.6.4/jquery.min.js

//   // По умолчанию раскрывающийся список реагирует на событие" click " и автоматически
//   // изменяет свое состояние на расширенное или свернутое.
//   var MyListBoxLayout = ymaps.templateLayoutFactory.createClass(
//     '<div id="my-listbox-header" >{{ data.title }}</div >' +
//     // Этот элемент будет служить контейнером для дочерних элементов списка.
//     '<div id="my-list-box" style="display: {% if state.expanded %}block{% else %}none{% endif %};" >' +
//     '</div >', {

//     build: function () {
//       MyListBoxLayout.superclass.build.call(this);
//       this.childContainerElement = $('#my-list-box').get(0);
//       // Каждый раз, когда мы перестраиваемся, мы генерируем событие
//       // это означает, что контейнер для дочерних элементов изменился.
//       // Формат события описан в интерфейсе IGroupControlLayout.
//       this.events.fire('childcontainerchange', {
//         newChildContainerElement: this.childContainerElement,
//         oldChildContainerElement: null
//       });
//     },

//     // Переопределим метод, который требует интерфейс IGroupControlLayout.
//     getChildContainerElement: function () {
//       return this.childContainerElement;
//     }
//   }
//   ),
//     // Создадим список и выставим созданный макет через опции.
//     listBox = new ymaps.control.ListBox({ options: { layout: MyListBoxLayout } });


//   // Пример 3.
//   // Использование элемента управления ListBox в качестве фильтра
//   // для отображения объектов на карте (поддерживается мультивыбор).
//   // Объекты добавляются на карту с помощью ObjectManager.

//   // Создание выпадающего списка с 5 элементами.
//   var listBoxItems = loadDrivers()
//     .map(function (title) {
//       return new ymaps.control.ListBoxItem({
//         data: {
//           content: title.name,
//           id: title.id
//         },
//         state: {
//           selected: false
//         }
//       });
//     });

//   // Теперь создаем выпадающий список из 5 пунктов.
//   var listBoxControl = new ymaps.control.ListBox({
//     data: {
//       content: 'Driver',
//       title: 'Filter'
//     },
//     items: listBoxItems,
//     state: {
//       // Указывает, что список расширен.
//       expanded: false,
//       filters: listBoxItems.reduce(function (filters, filter) {
//         filters[filter.data.get('id')] = filter.isSelected();
//         return filters;
//       }, {})
//     }
//   });

//   map.controls.add(listBoxControl);

//   // Добавление отслеживания к индикатору для проверки того, выбран ли элемент списка.
//   listBoxControl.events.add(['select', 'deselect'], function (e) {
//     var listBoxItem = e.get('target');
//     var filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
//     console.log(filters[listBoxItem.data.get('id')]);
//     filters[listBoxItem.data.get('id')] = listBoxItem.isSelected();
//     listBoxControl.state.set('filters', filters);


//   });

//   listBoxStoreControl.events.add(['select', 'deselect'], function (e) {
//     var listBoxStoreControl = e.get('target');
//     console.log('click');

//   });

//   // Отслеживание изменений в элементе управления.список.государственное поле.
//   var filterMonitor = new ymaps.Monitor(listBoxControl.state);
//   var objectManager = new ymaps.ObjectManager();

//   filterMonitor.add('filters', function (filters) {
//     // Применение фильтра к ObjectManager.
//     console.log(filters);

//     objectManager.setFilter(filters == 1);
//   });

//   function getFilterFunction(categories) {
//     return function (obj) {
//       var content = obj.properties.balloonContent;
//       return categories[content]
//     }
//   }
// }