import LocationRoom from './LocationRoom';

type LocationRoomLimited = Omit<LocationRoom, 'Attributes'>;

export default LocationRoomLimited;
