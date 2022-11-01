import AttributeChoice from './AttributeChoice';

type RequiredFields = 'Name' | 'IsActive' | 'Order';

export type AttributeChoiceEditable = Pick<AttributeChoice, RequiredFields>;
