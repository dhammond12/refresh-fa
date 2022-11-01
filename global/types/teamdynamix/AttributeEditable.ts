import Attribute from './Attribute';

type RequiredFields = 'ID' | 'Value';

export type AttributeEditable = Pick<Attribute, RequiredFields>;
