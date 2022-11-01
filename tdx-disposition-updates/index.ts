import { AzureFunction, Context } from '@azure/functions';
import fetchMovedComputers from '../global/apis/notifii/fetchMovedComputers';
import fetchLocation from '../global/apis/teamdynamix/fetchLocation';
import fetchLocations from '../global/apis/teamdynamix/fetchLocations';
import searchAssets from '../global/apis/teamdynamix/searchAssets';
import updateAsset from '../global/apis/teamdynamix/updateAsset';
import fetchAsset from '../global/apis/teamdynamix/fetchAsset';
import AssetEditable from '../global/types/teamdynamix/AssetEditable';
import LocationRoomLimited from '../global/types/teamdynamix/LocationRoomLimited';
import Location from '../global/types/teamdynamix/Location';
import getAssetStatusId from '../global/helpers/teamdynamix/getAssetStatusId';
import uploadBlob from '../global/apis/azure/uploadBlob';
import sendToWebhook from '../global/apis/teams/sendToWebhook';

/**
 * Every day at 9:00 AM EST, computers that have moved locations will be updated in TeamDynamix.
 * 
 * 1. Fetch all packages that have been signed out in Notifii.
 * 2. Extract only the computers from those packages.
 * 3. Parse information from each computer.
 * 4. Find that computer in TeamDynamix.
 * 5. Update that computer with the new information.
 * 6. Upload completed logs to Azure.
 * 7. Send summary notification to Teams.
 */
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    // Fetch computers that have moved
    const movedComputersResult = await fetchMovedComputers();
    if (!movedComputersResult.ok) {
        printAndWebhook(context, 'An error occured while fetching the moved computers: ' + movedComputersResult.error);
        return;
    }
    if (!movedComputersResult.data.length) {
        printAndWebhook(context, 'No computers have been moved.');
        return;
    }

    // Fetch all locations from TDX
    const locationsResult = await fetchLocations();
    if (!locationsResult.ok) {
        printAndWebhook(context, 'An error occured while fetching the list of TDX locations: ' + locationsResult.error);
        return;
    }

    // Validate and update each computer in TDX
    const statusLogs: { success: boolean; message: string }[] = [];
    const locationsCache = new Map<string, Location>();
    for (const movedComputer of movedComputersResult.data) {
        // Check if tag or serial exists
        if (!movedComputer.tag && !movedComputer.serial) {
            statusLogs.push({ success: false, message: 'Asset is missing tag and serial: ' + movedComputer.rawDescription });
            continue;
        }
        
        // Get if the tag or serial will be used to search TDX
        const searchAssetText = movedComputer.tag?.toString() ?? movedComputer.serial;

        // Check if new location exists
        if (!movedComputer.location) {
            statusLogs.push({ success: false, message: `Asset ${searchAssetText} is missing location: ` + movedComputer.rawSender });
            continue;
        }
        // Check if new status exists
        if (!movedComputer.status) {
            statusLogs.push({ success: false, message: `Asset status could not be determined for ${searchAssetText}.` });
            continue;
        }

        // Check that the location exists in the TDX locations list
        const foundLocation = locationsResult.data.find((location) => location.Name === movedComputer.location!.building);
        if (!foundLocation) {
            statusLogs.push({ success: false, message: `Building ${movedComputer.location.building} does not exist for ${searchAssetText}.` });
            continue;
        }

        // Check that the room exists for the location
        // First check the cache to avoid making an HTTP request
        let room: LocationRoomLimited | undefined;
        if (locationsCache.has(foundLocation.Name)) {
            room = locationsCache.get(foundLocation.Name)?.Rooms?.find((room) => room.Name === movedComputer.location!.room);
        } else {
            // If not in cache, fetch location from TDX to get its rooms
            const locationResult = await fetchLocation(foundLocation.ID);
            if (!locationResult.ok) {
                statusLogs.push({ success: false, message: locationResult.error });
                continue;
            }

            // Add fetched location to cache
            locationsCache.set(locationResult.data.Name, locationResult.data);

            // Search rooms list to see if it exists
            room = locationResult.data.Rooms?.find((room) => room.Name === movedComputer.location!.room);
        }

        // Room does not exist
        if (!room) {
            statusLogs.push({ success: false, message: `Room ${movedComputer.location.room} does not exist.` });
            continue;
        }

        // Search TDX assets by tag or serial (does not return all properties of the asset)
        const searchAssetsResult = await searchAssets({ SerialLike: searchAssetText });
        if (!searchAssetsResult.ok) {
            statusLogs.push({ success: false, message: searchAssetsResult.error });
            continue;
        }
        if (!searchAssetsResult.data.length) {
            statusLogs.push({ success: false, message: `No assets found for ${searchAssetText}.` });
            continue;
        }

        // Verify search result contains the asset with the specified tag/serial
        const foundAsset = searchAssetsResult.data.find(
            (asset) => asset.Tag === movedComputer.tag?.toString() || asset.SerialNumber === movedComputer.serial
        );
        if (!foundAsset) {
                statusLogs.push({ success: false, message: `No search results returned for '${searchAssetText}'.` });
                continue;
        }

        // Fetch full asset details from TDX. PATCH is not supported so the full asset must be loaded as a payload for the update request
        const assetResult = await fetchAsset(foundAsset.ID);
        if (!assetResult.ok) {
            statusLogs.push({ success: false, message: assetResult.error });
            continue;
        }

        // Get the TDX status ID to send in the payload
        const statusId = getAssetStatusId(movedComputer.status);
        if (!statusId) {
            statusLogs.push({ success: false, message: `Status '${movedComputer.status}' does not exist in TDX.` });
            continue;
        }

        // Format payload to update the computer
        const updatedAsset: AssetEditable = {
            ...assetResult.data,
            LocationID: foundLocation.ID,
            LocationRoomID: room.ID,
            StatusID: statusId
        };

        // Send request to update the computer
        const updatedAssetResult = await updateAsset(foundAsset.ID, updatedAsset);
        if (!updatedAssetResult.ok) {
            statusLogs.push({ success: false, message: updatedAssetResult.error });
            continue;
        }

        // Finished updating computer, begin next computer if exists
        statusLogs.push({ success: true, message: `Updated asset ${foundAsset.Tag} (${foundAsset.SerialNumber}) to ${foundLocation.Name} ${room.Name} with status ${movedComputer.status}.` });
    }

    // Format blob properties to upload the logs to Azure
    const fileName = new Date().toISOString() + '.txt';
    const fileContent = statusLogs.reduce((prev, curr) => (prev += curr.message + '\n'), '');
    const totalSuccess = statusLogs.reduce((prev, curr) => prev + (curr.success ? 1 : 0), 0);
    const totalFailure = statusLogs.reduce((prev, curr) => prev + (curr.success ? 0 : 1), 0);

    // Upload logs to Azure
    const uploadBlobResult = await uploadBlob('dispositions', fileName, fileContent);
    if (!uploadBlobResult.ok) {
        printAndWebhook(context, uploadBlobResult.error);
    }

    // Send notification to Teams
    const webhookResponse = await sendToWebhook(`Disposition updates finished with ${totalSuccess} updates and ${totalFailure} failures.`);
    if (!webhookResponse.ok) context.log(webhookResponse.error);

    context.log(`Disposition updates finished with ${totalSuccess} updates and ${totalFailure} failures.`);
};

/* ---------------------------- Helper functions ---------------------------- */

const printAndWebhook = (context: Context, message: string) => {
    context.log(message);
    sendToWebhook(message);
}

export default timerTrigger;

