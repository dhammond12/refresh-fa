const getAssetStatusId = (status: string): number | null => {
    switch (status) {
        case 'Storage':
            return 1418;
        case 'Deployed':
            return 1419;
        case 'Disposed':
            return 1420;
        case 'Missing':
            return 3814;
        case 'Add-on':
            return 3815;
        case 'Pending Return':
            return 3816;
        case 'Returned':
            return 3817;
        default:
            return null;
    }
};

export default getAssetStatusId;
