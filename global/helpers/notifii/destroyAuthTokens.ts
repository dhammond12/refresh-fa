import axios from 'axios';

const destroyAuthTokens = async (sessionId: string, sessionToken: string): Promise<void> => {
    await axios({
        url: 'https://portal.notifii.com/login.php?logout=yes',
        method: 'get',
        headers: {
            cookie: `ses_session_id=${sessionId}; ses_token=${sessionToken}`
        }
    });
};

export default destroyAuthTokens;
