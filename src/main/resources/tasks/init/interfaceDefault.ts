export const DEFAULT_INTERFACE_NAME = 'default';
const HIGHLIGHT_FIELD_ALLTEXT = '_alltext'; // NOTICE all lowercase!


export const DEFAULT_INTERFACE = {
	_name: DEFAULT_INTERFACE_NAME,
	//displayName: 'Default',
	collectionIds: [],
	fields: [{
		name: HIGHLIGHT_FIELD_ALLTEXT
	}],
	stopWords: [],
	synonymIds: []
};
