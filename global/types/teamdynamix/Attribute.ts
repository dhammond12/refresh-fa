import AttributeChoice from './AttributeChoice';

interface Attribute {
    ID: number;
    Name: string;
    Order: number;
    Description: string | null;
    SectionID: number;
    SectionName: string | null;
    FieldType: string;
    DataType: string;
    Choices: AttributeChoice[] | null;
    IsRequired: boolean;
    IsUpdatable: boolean;
    Value: string | null;
    ValueText: string | null;
    ChoicesText: string | null;
    AssociatedItemIDs: number[] | null;
}

export default Attribute;
