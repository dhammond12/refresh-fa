import Asset from './Asset';

type AssetSearchResult = Omit<Asset, 'Attributes' | 'Attachments'>;

export default AssetSearchResult;
