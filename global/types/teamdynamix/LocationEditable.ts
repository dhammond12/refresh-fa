import Location from "./Location";

type OptionalFields = 
    'Description'
    | 'ExternalID'
    | 'IsActive'
    | 'Address'
    | 'City'
    | 'State'
    | 'PostalCode'
    | 'Country'
    | 'IsRoomRequired'
    | 'Attributes'
    | 'Latitude'
    | 'Longitude';

type RequiredFields = 'Name';

type LocationEditable =
    Partial<Pick<Location, OptionalFields>>
    & Pick<Location, RequiredFields>;

export default LocationEditable;