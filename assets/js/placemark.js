function buildPlacemarkLayout(shop) {
  let placemark_class = (shop.status === 'visited') ? 'visited_circle_layout' : 'not_visited_circle_layout';
  return ymaps.templateLayoutFactory.createClass(
    `
        <div class="placemark_layout_container">
            <div class="circle_layout ${placemark_class}">
                <div>${shop.in_day_order}</div>
                
            </div>
        </div>
    `);
}

export { buildPlacemarkLayout}