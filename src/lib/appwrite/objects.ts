import { databases } from '$lib/appwrite';
import { PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_OBJECTS_TABLE_ID } from '$env/static/public';
import type { RoomObject, ContentType, DepthLayer } from '$lib/types';
import { Query } from 'appwrite';

export async function listObjects(roomId: string): Promise<RoomObject[]> {
	const res = await databases.listDocuments<RoomObject>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_OBJECTS_TABLE_ID,
		[Query.equal('roomId', roomId), Query.orderAsc('order')]
	);
	return res.documents;
}

export async function getObject(objectId: string): Promise<RoomObject> {
	return databases.getDocument<RoomObject>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_OBJECTS_TABLE_ID,
		objectId
	);
}

export async function createObject(data: {
	roomId: string;
	imageUrl: string;
	label: string;
	contentType: ContentType;
	content: string;
	positionX: number;
	positionY: number;
	depth: DepthLayer;
	scale: number;
}): Promise<RoomObject> {
	const objects = await listObjects(data.roomId);
	return databases.createDocument<RoomObject>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_OBJECTS_TABLE_ID,
		'unique()',
		{ ...data, order: objects.length }
	);
}

export async function updateObject(
	objectId: string,
	data: Partial<RoomObject>
): Promise<RoomObject> {
	return databases.updateDocument<RoomObject>(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_OBJECTS_TABLE_ID,
		objectId,
		data
	);
}

export async function deleteObject(objectId: string): Promise<void> {
	await databases.deleteDocument(
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_OBJECTS_TABLE_ID,
		objectId
	);
}
