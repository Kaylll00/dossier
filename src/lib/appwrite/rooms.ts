import { databases } from '$lib/appwrite';
import { PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_ROOMS_TABLE_ID } from '$env/static/public';
import type { Room } from '$lib/types';
import { Query } from 'appwrite';

export async function listRooms(): Promise<Room[]> {
	const res = await databases.listDocuments<Room>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_ROOMS_TABLE_ID,
		[Query.orderAsc('order')]
	);
	return res.documents;
}

export async function getRoom(roomId: string): Promise<Room> {
	return databases.getDocument<Room>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_ROOMS_TABLE_ID,
		roomId
	);
}

export async function createRoom(name: string, background: string): Promise<Room> {
	const rooms = await listRooms();
	return databases.createDocument<Room>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_ROOMS_TABLE_ID,
		'unique()',
		{ name, background, order: rooms.length }
	);
}

export async function updateRoom(roomId: string, data: Partial<Room>): Promise<Room> {
	return databases.updateDocument<Room>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_ROOMS_TABLE_ID,
		roomId,
		data
	);
}

export async function deleteRoom(roomId: string): Promise<void> {
	await databases.deleteDocument(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_ROOMS_TABLE_ID,
		roomId
	);
}
