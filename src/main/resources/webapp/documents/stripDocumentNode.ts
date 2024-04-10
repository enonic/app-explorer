import type { DocumentNode } from '@enonic-types/lib-explorer/Document';


import { startsWith } from '@enonic/js-utils/string/startsWith';


export default function stripDocumentNode(documentNode: DocumentNode): Partial<DocumentNode> {
	const strippedDocumentNode: Partial<DocumentNode> = {};
	// Not allowed to see any underscore fields (except _id, _name, _path)
	Object.keys(documentNode).forEach((k) => {
		if (
			!startsWith(k, '_')
			|| k === '_id'
			|| k === '_name'
			|| k === '_path'
		) {
			strippedDocumentNode[k] = documentNode[k];
		}
	});
	return strippedDocumentNode;
}
