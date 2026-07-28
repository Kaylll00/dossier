export type BackgroundPreset = {
	id: string;
	label: string;
	css: string;
};

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
	{
		id: 'dusk',
		label: 'Dusk',
		css: 'radial-gradient(circle at 50% 30%, #3a2b52 0%, #0e0d16 70%)'
	},
	{
		id: 'ember',
		label: 'Ember',
		css: 'radial-gradient(circle at 50% 30%, #4a2d1a 0%, #0e0d16 70%)'
	},
	{
		id: 'tide',
		label: 'Tide',
		css: 'radial-gradient(circle at 50% 30%, #1a3a42 0%, #0a1620 70%)'
	},
	{
		id: 'fog',
		label: 'Fog',
		css: 'radial-gradient(circle at 50% 30%, #4a3a3a 0%, #17151f 70%)'
	},
	{
		id: 'meadow',
		label: 'Meadow',
		css: 'radial-gradient(circle at 50% 30%, #2a3a24 0%, #0e130e 70%)'
	}
];
