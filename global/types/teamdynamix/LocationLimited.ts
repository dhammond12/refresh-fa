import Location from './Location';

type MissingFields = 'Attributes' | 'AssetsCount' | 'ConfigurationItemsCount' | 'TicketsCount' | 'RoomsCount' | 'UsersCount' | 'Rooms';

type LocationLimited = Omit<Location, MissingFields>;

export default LocationLimited;
