import ConfigItem from "./ConfigItem";

type OptionalFields =
    'FormID'
    | 'MaintenanceScheduleID'
    | 'OwnerUID'
    | 'OwningGroupID'
    | 'LocationID'
    | 'LocationRoomID'
    | 'IsActive'
    | 'ExternalID'
    | 'ExternalSourceID'
    | 'Attributes';

type RequiredFields = 'Name' | 'TypeID';

type ConfigItemEditableEditable =
    Partial<Pick<ConfigItem, OptionalFields>>
    & Pick<ConfigItem, RequiredFields>;

export default ConfigItemEditableEditable;