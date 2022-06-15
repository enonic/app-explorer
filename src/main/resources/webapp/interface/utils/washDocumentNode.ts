import type {DocumentNode} from '/lib/explorer/types/index.d';


export function washDocumentNode(node :DocumentNode) {
	Object.keys(node).forEach((k) => {
		if (k.startsWith('_') || k.startsWith('document_metadata')) {
			delete node[k as keyof DocumentNode];
		}
	});
	return node;
}
