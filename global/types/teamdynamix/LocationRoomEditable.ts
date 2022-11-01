import LocationRoom from "./LocationRoom";

type OptionalFields = 
    'ExternalID'
    | 'Description'
    | 'Floor'
    | 'Capacity'
    | 'Attributes';

type RequiredFields = 'Name';

type LocationRoomEditable =
    Partial<Pick<LocationRoom, OptionalFields>>
    & Pick<LocationRoom, RequiredFields>;

export default LocationRoomEditable;