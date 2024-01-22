const fs = require('fs');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { DateTime } = require('luxon');

const keyvaultUrl = "https://vault.azure.net/";

const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyvaultUrl, credential);

const csvFilePath = "secrets.csv";

const csvContent = fs.readFileSync(csvFilePath);
const csvRows = csvContent.split('\n').map(row => row.split(';'));

csvRows.forEach(row => {
    if (row.length >= 2) {
        const secretName = row[0];
        const secretValue = row[1];
        const secretExpiration = row[2];

        if (secretExpiration && secretExpiration.trim() !== "") {
            const datetimeObject = DateTime.fromFormat(secretExpiration, 'MM/dd/yy');
            console.log(secretName, secretValue, datetimeObject.toJSDate());
            secretClient.setSecret(secretName, secretValue, { expiresOn: datetimeObject });
        } else {
            secretClient.setSecret(secretName, secretValue);
            console.log(secretName, secretValue);
        }
    }
});

console.log("Secrets added to Azure Key Vault successfully.");