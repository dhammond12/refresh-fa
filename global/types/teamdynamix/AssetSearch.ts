import Attribute from './Attribute';

interface AssetSearch {
    SerialLike?: string | null;
    SearchText?: string | null;
    SavedSearchID?: number;
    StatusIDs?: number[] | null;
    ExternalIDs?: string[] | null;
    IsInService?: boolean | null;
    StatusIDsPast?: number[] | null;
    SupplierIDs?: number[] | null;
    ManufacturerIDs?: number[] | null;
    LocationIDs?: number[] | null;
    RoomID?: number;
    ParentIDs?: number[] | null;
    ContractIDs?: number[] | null;
    ExcludeContractIDs?: number[] | null;
    TicketIDs?: number[] | null;
    ExcludeTicketIDs?: number[] | null;
    FormIDs?: number[] | null;
    ProductModelIDs?: number[] | null;
    MaintenanceScheduleIDs?: number[] | null;
    UsingDepartmentIDs?: number[] | null;
    RequestingDepartmentIDs?: number[] | null;
    OwningDepartmentIDs?: number[] | null;
    OwningDepartmentIDsPast?: number[] | null;
    UsingCustomerIDs?: string | null;
    RequestingCustomerIDs?: string | null;
    OwningCustomerIDs?: string | null;
    OwningCustomerIDsPast?: string | null;
    CustomAttributes?: Attribute[] | null;
    PurchaseCostFrom?: number;
    PurchaseCostTo?: number;
    ContractProviderID?: number;
    AcquisitionDateFrom?: string;
    AcquisitionDateTo?: string;
    ExpectedReplacementDateFrom?: string;
    ExpectedReplacementDateTo?: string;
    ContractEndDateFrom?: string;
    ContractEndDateTo?: string;
    OnlyParentAssets?: boolean;
    MaxResults?: number | null;
}

export default AssetSearch;
