import type { Models } from 'appwrite';

export type ContentType = 'memory' | 'poem' | 'fact';

export type DepthLayer = 'background' | 'midground' | 'foreground';

export type Room = Models.Document & {
	name: string;
	background: string;
	order: number;
};

export type RoomObject = Models.Document & {
	roomId: string;
	imageUrl: string;
	label: string;
	contentType: ContentType;
	content: string;
	positionX: number;
	positionY: number;
	depth: DepthLayer;
	scale: number;
	order: number;
};
