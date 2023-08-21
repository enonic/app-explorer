import type {
	DocumentNode,
	MetaData
} from '/lib/explorer/types/Document';


import {
	FieldPath
} from '@enonic/explorer-utils';
import { startsWith } from '@enonic/js-utils/string/startsWith';
// import { HTTP_RESPONSE_STATUS_CODES } from '../constants';

export interface BodyItem {
	action?: 'create' | 'read' | 'update' | 'delete'
	id?: string // Not on failed create
	error?: string
	document?: Record<string, unknown>
	documentType?: string
	documentTypeId?: string
	metadata?: MetaData
	name?: string
	path?: string
	status?: number // Only in bulk responses
}

export default function documentNodeToBodyItem({
	documentNode,
	includeDocument = true,
	includeMetadata = false
}: {
	documentNode: DocumentNode
	includeDocument?: boolean
	includeMetadata?: boolean
}): BodyItem {
	const bodyItem: BodyItem = {
		id: documentNode._id,
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
		bodyItem.document = document;
	}

	if (includeMetadata) {
		bodyItem.metadata = documentNode[FieldPath.META];
	}

	return bodyItem;
}
