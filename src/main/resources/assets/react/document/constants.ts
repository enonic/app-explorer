export enum Column {
	COLLECTION = '_collection',
	DOCUMENT_TYPE = '_documentType',
	ID = '_id',
	JSON = '_json',
	LANGUAGE = '_language'
}
export const SELECTED_COLUMNS_DEFAULT = [
	Column.JSON,
	Column.ID,
	Column.COLLECTION,
	Column.DOCUMENT_TYPE,
	Column.LANGUAGE
] as const; // as const also makes it readonly, so be careful to dereference when it is used in something muteable

export const POST_TAG = '</b>';
export const PRE_TAG = '<b class="bgc-y">';