import { AxiosRequestConfig } from 'axios';
import fetchFromApi from '../../helpers/teamdynamix/fetchFromApi';
import DataOrError from '../../types/DataOrError';
import Asset from '../../types/teamdynamix/Asset';
import AssetEditable from '../../types/teamdynamix/AssetEditable';

const updateAsset = async (assetId: number, updatedAsset: AssetEditable): Promise<DataOrError<Asset>> => {
    const config: AxiosRequestConfig = {
        url: `${process.env.TDX_API_URL}/${process.env.TDX_ASSETS_APP_ID}/assets/${assetId}`,
        method: 'post',
        data: updatedAsset
    };

    return await fetchFromApi<Asset>('UPDATE_ASSET', config);
};

export default updateAsset;
