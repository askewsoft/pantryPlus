export enum Tooltip {
  nickname = 'nickname',
  email = 'email',
  location = 'location',
  locationName = 'locationName',
  latitude = 'latitude',
  longitude = 'longitude',
  lastPurchaseDate = 'lastPurchaseDate',
};

export const tooltipNotes = {
  [Tooltip.nickname]: 'Nickname is how you will be known in the app. Changing this will not affect your ability to login. It will be visible to other users in shared groups.',
  [Tooltip.email]: 'Email is used to login to the app. Changing this will alter how you login.',
  [Tooltip.location]: 'This will enable or disable location services for the app. This is used to determine your location when you reorder categories and purchase a product.',
  [Tooltip.locationName]: 'This is the name of the location you are shopping at.',
  [Tooltip.latitude]: 'This is the latitude of the location',
  [Tooltip.longitude]: 'This is the longitude of the location',
  [Tooltip.lastPurchaseDate]: 'Date of the last purchase at this location, if any. Locations you or a group mate created may appear before any purchase.',
};