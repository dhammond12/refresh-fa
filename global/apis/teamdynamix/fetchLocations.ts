import { AxiosRequestConfig } from 'axios';
import fetchFromApi from '../../helpers/teamdynamix/fetchFromApi';
import DataOrError from '../../types/DataOrError';
import LocationLimited from '../../types/teamdynamix/LocationLimited';

const fetchLocations = async (): Promise<DataOrError<LocationLimited[]>> => {
    const config: AxiosRequestConfig = {
        url: `${process.env.TDX_API_URL}/locations`,
        method: 'get'
    };

    return await fetchFromApi<LocationLimited[]>('FETCH_LOCATIONS', config);
};

export default fetchLocations;
