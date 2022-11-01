import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import csv = require('csv-parser');
import { Readable } from 'stream';
import Package from '../../types/notifii/Package';
import fetchAuthTokens from '../../helpers/notifii/fetchAuthTokens';
import MovedComputer, { MovedComputerLocation } from '../../types/notifii/MovedComputer';
import getErrorMessage from '../../utils/getErrorMessage';
import DataOrError from '../../types/DataOrError';
import destroyAuthTokens from '../../helpers/notifii/destroyAuthTokens';

const fetchMovedComputers = async (): Promise<DataOrError<MovedComputer[]>> => {
    // Get auth tokens from Notifii
    const authTokens = await fetchAuthTokens();
    if (!authTokens.ok) return { ok: false, error: authTokens.error};

    // Calculate the move date that will be queried in Notifii
    const movedDate = getMovedDate();

    // Format the request to Notifii
    const config: AxiosRequestConfig = {
        url: `${process.env.NOTIFII_URL}/track/export-package-history.php?mid=${process.env.NOTIFII_MAIL_ID}&date=picked_up&start=${movedDate}&end=${movedDate}&status=picked_up`,
        method: 'get',
        headers: {
            cookie: `ses_session_id=${authTokens.data.sessionId}; ses_token=${authTokens.data.sessionToken}`
        },
        responseType: 'arraybuffer',
        maxRedirects: 0
    };

    // Send request to Notifii
    let response: AxiosResponse;
    try {
        response = await axios(config);
    } catch (error: any) {
        return { ok: false, error: getErrorMessage(error) };
    }

    // Format the csv response to an array of objects and parse out the computers
    let computers: MovedComputer[];
    try {
        const packages: Package[] = [];

        computers = await new Promise((resolve) => {
            Readable.from(response.data)
            .pipe(
                csv({
                    mapHeaders: ({ header }) => header.trim()
                })
            )
            .on('data', (data) => packages.push(data))
            .on('end', () => resolve(parseComputers(packages)));
        });
    } catch (error: any) {
        return { ok: false, error: getErrorMessage(error) };
    }

    // End session created with Notifii
    destroyAuthTokens(authTokens.data.sessionId, authTokens.data.sessionToken);

    return { ok: true, data: computers };
};

/* ---------------------------- Helper functions ---------------------------- */

/**
 * Gets the date of the previous business day.
 * @returns The previous business day's date in YYYY-MM-DD format.
 */
const getMovedDate = (): string => {
    const today = new Date();
    let movedDate: number;

    // If today is Monday, return the previous Friday
    if (today.getDay() === 1) {
        movedDate = today.getTime() - 1000 * 60 * 60 * 24 * 3;
    // Else return the date of the day before
    } else {
        movedDate = today.getTime() - 1000 * 60 * 60 * 24;
    }

    return new Date(movedDate).toISOString().split('T')[0];
};

/**
 * Extracts the packages that are of type 'COMPUTER'.
 * @param packages
 * @return The computer packages.
 */
const parseComputers = (packages: Package[]): MovedComputer[] => {
    const computers: MovedComputer[] = [];

    packages.forEach((packageItem) => {
        if (packageItem['Package Type'] === 'COMPUTER') {
            const tag = parseTag(packageItem);
            const serial = parseSerial(packageItem);
            const location = parseLocation(packageItem);
            const bot = parseBot(packageItem);
            const status = generateStatus(bot, location);

            computers.push({
                tag,
                serial,
                location,
                status,
                rawDescription: packageItem['Custom Message'],
                rawSender: packageItem['Sender']
            });
        }
    });

    return computers;
};

/**
 * Parses the tag number out of the custom message/description of the package. The typical
 * custom message format is "OPTIPLEX 7090 | TAG# 45424 | SN# DSF83H2". There are scenarios
 * where the tag section and serial section are swapped, and this checks for that as well.
 * @param packageItem 
 * @returns The tag number or null if it could not be found.
 */
const parseTag = (packageItem: Package): number | null => {
    const message = packageItem['Custom Message'].toUpperCase();
    const messageSections = message.split('|');
    
    // Check if message is partitioned by '|' and if the second section exists
    let tagSection = messageSections[1];
    if (!tagSection) return null;

    // Check the second section to see if the tag is present
    let findLabel = tagSection.indexOf('TAG');
    if (findLabel === -1) {
        // 'TAG' not found in second section of Custom Message, try the third
        tagSection = messageSections[2];
        if (!tagSection) return null;

        findLabel = tagSection.indexOf('TAG');
        if (findLabel === -1) return null;
    }

    // Get substring after TAG label and capture all chars that are numbers
    const tagAfterLabel = tagSection.slice(findLabel + 3);
    let tagNumStart = -1;
    let tagNumEnd = -1;

    for (let i = 0; i < tagAfterLabel.length; i++) {
        const char = tagAfterLabel.charAt(i);

        if (char.match(/[0-9]/)) {
            if (tagNumStart === -1) {
                tagNumStart = i;
            }
            tagNumEnd = i;
        }
    }

    // No numbers were captured, tag does not exist
    if (tagNumStart === -1 || tagNumEnd === -1) return null;

    // Check tag is a valid number and return
    const generatedString = tagAfterLabel.slice(tagNumStart, tagNumEnd + 1);
    const computerTag = parseInt(generatedString);

    if (isNaN(computerTag)) return null;

    return computerTag;
};

/**
 * Parses the serial number out of the custom message/description of the package. The typical
 * custom message format is "OPTIPLEX 7090 | TAG# 45424 | SN# DSF83H2". There are scenarios
 * where the serial section and tag section are swapped, and this checks for that as well.
 * @param packageItem 
 * @returns The serial number or null if it could not be found.
 */
const parseSerial = (packageItem: Package): string | null => {
    const message = packageItem['Custom Message'].toUpperCase();
    const messageSections = message.split('|');

    // Check if message is partitioned by '|' and if the third section exists
    let serialSection = messageSections[2];
    if (!serialSection) return null;

    // Check the third section to see if the serial is present
    let findLabel = serialSection.indexOf('SN');
    if (findLabel === -1) {
        // 'SN' not found in third section of Custom Message, try the second
        serialSection = messageSections[1];
        if (!serialSection) return null;

        findLabel = serialSection.indexOf('SN');
        if (findLabel === -1) return null;
    }

    // Get substring after SN label and capture all chars until there's a whitespace
    const serialAfterLabel = serialSection.slice(findLabel + 2);
    let start = -1;
    let end = -1;

    for (let i = 0; i < serialAfterLabel.length; i++) {
        const char = serialAfterLabel.charAt(i);

        if (char.match(/\w/)) {
            if (start === -1) {
                start = i;
            }
            end = i;
        }

        if (char.match(/\W/)) {
            if (start !== -1) {
                break;
            }
        }
    }

    // No chars were captured, serial does not exist
    if (start === -1 || end === -1) return null;

    // Return serial
    const generatedString = serialAfterLabel.slice(start, end + 1);

    return generatedString;
};

/**
 * Parses the 'to' location out of the sender field of a package. The typical sender field
 * looks like 'DLRC 224 / BWHS' for packages moving to the warehouse, or 'BWHS / DLRC 224'
 * for packages moving out of the warehouse. This will extract the location after the slash.
 * @param packageItem 
 * @returns The location the package was moved to or null if it does not exist.
 */
const parseLocation = (packageItem: Package): MovedComputerLocation | null => {
    const sender = packageItem.Sender;
    const senderSections = sender.split('/');

    // Check if the sender is partitioned by '/'
    const toSection = senderSections[1];
    if (!toSection) {
        // If not, fallback to the service type to see if it was registered as a pick up
        if (packageItem['Service Type'] === 'Internal Pick Up') {
            return {
                building: 'BWHS',
                room: '100'
            };
        }

        return null;
    }

    // Check if it is being moved to the warehouse
    const toLocation = toSection.trim();
    if (toLocation === 'BWHS') {
        return {
            building: 'BWHS',
            room: '100'
        };
    }

    // Parse if location format is in [BLDG] [ROOM] format
    let toBuilding = toLocation.split(' ')[0];
    let toRoom = toLocation.split(' ')[1];
    if (!toBuilding || !toRoom) {
        // Try parsing if location format is in [BLDG][ROOM] format (no space)
        toBuilding = '';
        toRoom = '';
        let start = -1;
        let end = -1;

        // Steps through the chars until a number is found to separate the building code (letters) from the room (numbers + optional letter)
        for (let i = 0; i < toLocation.length; i++) {
            const char = toLocation.charAt(i);

            if (char.match(/[a-zA-Z]/)) {
                if (start === -1) {
                    start = i;
                }
                end = i;
            } else {
                if (!toBuilding) {
                    if (start >= 0 && end >= 0) {
                        toBuilding = toLocation.slice(start, end + 1);
                        start = -1;
                        end = -1;
                    } else {
                        return null;
                    }
                }
                if (start === -1) {
                    start = i;
                }
                end = i;
            }
            if (i === toLocation.length - 1) {
                if (!toBuilding) {
                    return null;
                }
                if (!toRoom) {
                    if (start >= 0 && end >= 0) {
                        toRoom = toLocation.slice(start, end + 1);
                    } else {
                        return null;
                    }
                }
            }
        }
    }

    return {
        building: toBuilding,
        room: toRoom
    };
};

const parseBot = (packageItem: Package): string | null => {
    const message = packageItem['Custom Message'];
    const bot = message.match(/BOT\s*[2][0-9]{3}-([0][1-9]|[1][0-2])-([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])/);
    if (!bot) {
        return null;
    }

    const parseDate = bot[0].slice(3).trim();

    return parseDate;
};

const generateStatus = (bot: string | null, location: MovedComputerLocation): string | null => {
    if (!location) {
        return null;
    }

    if (location.building !== 'BWHS' && location.room !== '100') {
        return 'Deployed';
    }

    if (!bot) {
        return 'Pending Return';
    }

    const botInMilliseconds = Date.parse(bot);
    if (isNaN(botInMilliseconds)) {
        return null;
    }

    const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
    if (botInMilliseconds - Date.now() < sixMonths) {
        return 'Pending Return';
    } else {
        return 'Storage';
    }
};

export default fetchMovedComputers;
