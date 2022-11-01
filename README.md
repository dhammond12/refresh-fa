# refresh-fa
The function app hosted in Azure Functions for all things related to the computer refresh process.

## tdx-disposition-updates
All leased computers were imported to the TeamDynamix Assets application. One challenge of an asset management database is the constant movement of assets. This function eliminates the manual data entry required to keep the database up to date for every move. This process runs daily at 9:00 AM EST:

1. Web scrape the package delivery software that is used by the warehouse staff.
2. Extract all packages that were delivered or picked up the previous business day.
3. Parse the service tag and serial number from the package's ticket information.
4. Search and return the asset in TeamDynamix which matches the service tag.
5. Update the TeamDynamix asset to its new location, as well as determine an appropriate
new status.
6. Upload a report to an Azure Blob Container containing successful and unsuccessful updates.
7. Send a message to the refresh team in Teams via a Teams webhook.

**Notification from Teams**

![Notification from Teams](https://i.imgur.com/9WbYA9u.png)

**Verify updates in TeamDynamix**

![Verify updates in TeamDynamix](https://i.imgur.com/5qza0xI.png)

**Check log for failures**

![Check log for failures](https://i.imgur.com/h08TeuY.png)
