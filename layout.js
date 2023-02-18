// import 'https://yandex.st/jquery/1.6.4/jquery.min.js';


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



export { DriversListBoxLayout, ShopsListBoxLayout, ListBoxItemLayout }