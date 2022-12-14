import Attribute from './Attribute';

interface TicketSearch {
    TicketClassification?: number[] | null;
    MaxResults?: number;
    TicketID?: number | null;
    ParentTicketID?: number | null;
    SearchText?: string | null;
    StatusIDs?: number[] | null;
    PastStatusIDs?: number[] | null;
    StatusClassIDs?: number[] | null;
    PriorityIDs?: number[] | null;
    UrgencyIDs?: number[] | null;
    ImpactIDs?: number[] | null;
    AccountIDs?: number[] | null;
    TypeIDs?: number[] | null;
    SourceIDs?: number[] | null;
    UpdatedDateFrom?: string | null;
    UpdatedDateTo?: string | null;
    UpdatedByUid?: string | null;
    ModifiedDateFrom?: string | null;
    ModifiedDateTo?: string | null;
    ModifiedByUid?: string | null;
    StartDateFrom?: string | null;
    StartDateTo?: string | null;
    EndDateFrom?: string | null;
    EndDateTo?: string | null;
    RespondedDateFrom?: string | null;
    RespondedDateTo?: string | null;
    RespondedByUid?: string | null;
    ClosedDateFrom?: string | null;
    ClosedDateTo?: string | null;
    ClosedByUid?: string | null;
    RespondByDateFrom?: string | null;
    RespondByDateTo?: string | null;
    CloseByDateFrom?: string | null;
    CloseByDateTo?: string | null;
    CreatedDateFrom?: string | null;
    CreatedDateTo?: string | null;
    CreatedByUid?: string | null;
    DaysOldFrom?: number | null;
    DaysOldTo?: number | null;
    ResponsibilityUids?: string[] | null;
    ResponsibilityGroupIDs?: number[] | null;
    CompletedTaskResponsibilityFilter?: boolean | null;
    PrimaryResponsibilityUids?: string[] | null;
    PrimaryResponsibilityGroupIDs?: number[] | null;
    SlaIDs?: number[] | null;
    SlaViolationStatus?: boolean | null;
    SlaUnmetConstraints?: number;
    KBArticleIDs?: number[] | null;
    AssignmentStatus?: boolean | null;
    ConvertedToTask?: boolean | null;
    ReviewerUid?: string | null;
    RequestorUids?: string[] | null;
    RequestorNameSearch?: string | null;
    RequestorEmailSearch?: string | null;
    RequestorPhoneSearch?: string | null;
    ConfigurationItemIDs?: number[] | null;
    ExcludeConfigurationItemIDs?: number[] | null;
    IsOnHold?: boolean | null;
    GoesOffHoldFrom?: string | null;
    GoesOffHoldTo?: string | null;
    LocationIDs?: number[] | null;
    LocationRoomIDs?: number[] | null;
    ServiceIDs?: number[] | null;
    CustomAttributes?: Attribute | null;
    HasReferenceCode?: boolean | null;
}

export default TicketSearch;
