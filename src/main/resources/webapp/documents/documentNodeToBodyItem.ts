import type {
	DocumentNode,
	MetaData
} from '/lib/explorer/types/Document';


import {
	FieldPath
} from '@enonic/explorer-utils';
import { startsWith } from '@enonic/js-utils/string/startsWith';
// import { HTTP_RESPONSE_STATUS_CODES } from '../constants';


export interface RequestItem {
	action?: 'create' | 'get' | 'modify' | 'delete' // Only in bulk
	id?: string // Not on create
	// error?: string
	document?: Record<string, unknown>
	name?: string
	path?: string
	status?: number // Only in bulk responses
	// Metadata:
	// collection?: string
	// createdTime?: Date | string
	documentType?: string
	documentTypeId?: string
	// modifiedTime?: Date | string
	language?: string
	stemmingLanguage?: string
	valid?: boolean
}


export interface ResponseItem {
	action?: 'create' | 'get' | 'modify' | 'delete' // Only in bulk
	id?: string // Not on failed create
	error?: string
	// message?: string // NOTE: Currently not in use
	document?: Record<string, unknown>
	// documentTypeId?: string
	// name?: string
	// path?: string
	status?: number // Only in bulk responses
	// Metadata:
	collection?: string
	createdTime?: Date | string
	documentType?: string
	language?: string
	modifiedTime?: Date | string
	stemmingLanguage?: string
	valid?: boolean
}


export default function documentNodeToBodyItem({
	documentNode,
	includeDocument = true,
}: {
	documentNode: DocumentNode
	includeDocument?: boolean
}): ResponseItem {
	const responseItem: ResponseItem = {
		id: documentNode._id,
		...documentNode[FieldPath.META]
		// status: HTTP_RESPONSE_STATUS_CODES.OK // Added only for bulk reponses
	};

	if (includeDocument) {
		const document = {};
		Object.keys(documentNode).forEach((k) => {
			if (
				!startsWith(k, '_')
				&& k !== FieldPath.META
			) {
				document[k] = documentNode[k];
			}
		});
		responseItem.document = document;
	}

	return responseItem;
}
