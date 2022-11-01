import Asset from './Asset';

type OptionalFields =
    | 'FormID'
    | 'ProductModelID'
    | 'SupplierID'
    | 'LocationID'
    | 'LocationRoomID'
    | 'Tag'
    | 'SerialNumber'
    | 'Name'
    | 'PurchaseCost'
    | 'AcquisitionDate'
    | 'ExpectedReplacementDate'
    | 'RequestingCustomerID'
    | 'RequestingDepartmentID'
    | 'OwningCustomerID'
    | 'OwningDepartmentID'
    | 'ParentID'
    | 'MaintenanceScheduleID'
    | 'ExternalID'
    | 'ExternalSourceID'
    | 'Attributes';

type RequiredFields = 'StatusID';

type AssetEditable = Partial<Pick<Asset, OptionalFields>> & Pick<Asset, RequiredFields>;

export default AssetEditable;
