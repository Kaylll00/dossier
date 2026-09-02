import { Account, Client, Databases, Storage } from 'appwrite';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';

export const client = new Client()
	.setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
	.setProject(PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function ensureSession() {
	try {
		await account.get();
	} catch {
		try {
			await account.createAnonymousSession();
		} catch (e) {
			console.warn('Could not create anonymous session:', e);
		}
	}
}
