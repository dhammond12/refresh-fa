import Attribute from './Attribute';

interface LocationRoom {
    ID: number;
    Name: string;
    ExternalID: string | null;
    Description: string | null;
    Floor: string | null;
    Capacity: number | null;
    AssetsCount: number;
    ConfigurationItemsCount: number;
    TicketsCount: number;
    UsersCount: number;
    CreatedDate: string;
    CreatedUID: string;
    CreatedFullName: string;
    Attributes: Attribute[] | null;
}

export default LocationRoom;
