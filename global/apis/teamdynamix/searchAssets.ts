import { AxiosRequestConfig } from 'axios';
import AssetSearch from '../../types/teamdynamix/AssetSearch';
import AssetSearchResult from '../../types/teamdynamix/AssetSearchResult';
import fetchFromApi from '../../helpers/teamdynamix/fetchFromApi';
import DataOrError from '../../types/DataOrError';

const searchAssets = async (searchOptions: AssetSearch): Promise<DataOrError<AssetSearchResult[]>> => {
    const config: AxiosRequestConfig = {
        url: `${process.env.TDX_API_URL}/${process.env.TDX_ASSETS_APP_ID}/assets/search`,
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: searchOptions
    };

    return await fetchFromApi<AssetSearchResult[]>('SEARCH_ASSETS', config);
};

export default searchAssets;
