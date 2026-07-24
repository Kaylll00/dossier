import { Account, Client, Databases } from 'appwrite';

const client = new Client()
	.setEndpoint('https://sgp.cloud.appwrite.io/v1')
	.setProject('6a63488d00074c93a68a');

const account = new Account(client);
const databases = new Databases(client);

export { account, client, databases };
