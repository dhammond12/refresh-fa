const getErrorMessage = (err: any): string => {
    const errorMessages: string[] = [];

    // Axios errors
    if (err.response) {
        if (err.response.status) {
            errorMessages.push(err.response.status);
        }
        if (err.response.statusText) {
            errorMessages.push(err.response.statusText);
        }
        if (err.response.data) {
            if (typeof err.response.data === 'object') {
                errorMessages.push(JSON.stringify(err.response.data));
            } else {
                errorMessages.push(err.response.data);
            }
        }
    // Default errors
    } else if (err.message) {
        errorMessages.push(err.message);
    } else {
        errorMessages.push(err);
    }

    return errorMessages.join(' ');
};

export default getErrorMessage;
