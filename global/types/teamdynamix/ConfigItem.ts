import Attribute from './Attribute';

interface ConfigItem {
    ID: number;
    AppID: number;
    AppName: string;
    FormID: number;
    FormName: string;
    IsSystemMaintained: boolean;
    BackingItemID: number;
    BackingItemType: number;
    Name: string;
    TypeID: number;
    TypeName: string;
    MaintenanceScheduleID: number;
    MaintenanceScheduleName: string;
    OwnerUID: string;
    OwnerFullName: string;
    OwningDepartmentID: number;
    OwningDepartmentName: string;
    OwningGroupID: number;
    OwningGroupName: string;
    LocationID: number;
    LocationName: string;
    LocationRoomID: number;
    LocationRoomName: string;
    IsActive: boolean;
    CreatedDateUtc: string;
    CreatedUid: string;
    CreatedFullName: string;
    ModifiedDateUtc: string;
    ModifiedUid: string;
    ModifiedFullName: string;
    ExternalID: string;
    ExternalSourceID: number;
    ExternalSourceName: string;
    Attributes: Attribute[];
    Attachments: any[];
    Uri: string;
}

export default ConfigItem;
