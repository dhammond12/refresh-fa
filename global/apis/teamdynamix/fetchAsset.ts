import { AxiosRequestConfig } from 'axios';
import fetchFromApi from '../../helpers/teamdynamix/fetchFromApi';
import DataOrError from '../../types/DataOrError';
import Asset from '../../types/teamdynamix/Asset';

const fetchAsset = async (assetId: number): Promise<DataOrError<Asset>> => {
    const config: AxiosRequestConfig = {
        url: `${process.env.TDX_API_URL}/${process.env.TDX_ASSETS_APP_ID}/assets/${assetId}`,
        method: 'get'
    };

    return fetchFromApi<Asset>('FETCH_ASSET', config);
};

export default fetchAsset;
