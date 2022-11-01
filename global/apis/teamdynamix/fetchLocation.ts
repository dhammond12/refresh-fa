import { AxiosRequestConfig } from 'axios';
import fetchFromApi from '../../helpers/teamdynamix/fetchFromApi';
import DataOrError from '../../types/DataOrError';
import Location from '../../types/teamdynamix/Location';

const fetchLocation = async (locationId: number): Promise<DataOrError<Location>> => {
    const config: AxiosRequestConfig = {
        url: `${process.env.TDX_API_URL}/locations/${locationId}`,
        method: 'get'
    };

    return await fetchFromApi<Location>('FETCH_LOCATION', config);
};

export default fetchLocation;
