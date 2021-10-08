export function notDocumentMetaData(v) {
	if (v === 'document_metadata') {
		return "Can't be document_metadata";
	} else if (v.startsWith('document_metadata.')) {
		return "Can't start with document_metadata.";
	}
	return undefined;
}
