import type {DocumentNode} from '/lib/explorer/types/index.d';


export function washDocumentNode(node :DocumentNode) {
	const deref = JSON.parse(JSON.stringify(node));
	Object.keys(deref).forEach((k) => {
		if (k.startsWith('_') || k.startsWith('document_metadata')) {
			delete deref[k as keyof DocumentNode];
		}
	});
	return deref;
}
