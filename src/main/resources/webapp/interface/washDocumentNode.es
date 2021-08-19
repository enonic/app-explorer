export function washDocumentNode(node) {
	Object.keys(node).forEach((k) => {
		if (k.startsWith('_') || k.startsWith('document_metadata')) {
			delete node[k];
		}
	});
	return node;
}
