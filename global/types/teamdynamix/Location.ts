import Attribute from './Attribute';
import LocationRoomLimited from './LocationRoomLimited';

interface Location {
    ID: number;
    Name: string;
    Description: string | null;
    ExternalID: string | null;
    IsActive: boolean;
    Address: string | null;
    City: string | null;
    State: string | null;
    PostalCode: string | null;
    Country: string | null;
    IsRoomRequired: boolean;
    Attributes: Attribute[] | null;
    AssetsCount: number;
    ConfigurationItemsCount: number;
    TicketsCount: number;
    RoomsCount: number;
    UsersCount: number;
    Rooms: LocationRoomLimited[] | null;
    CreatedDate: string;
    CreatedUid: string;
    CreatedFullName: string;
    ModifiedDate: string;
    ModifiedUid: string;
    ModifiedFullName: string;
    Latitude: number | null;
    Longitude: number | null;
}

export default Location;
