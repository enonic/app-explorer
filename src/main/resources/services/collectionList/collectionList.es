import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {query as queryCollectors} from '/lib/explorer/collector/query';


export function get() {
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const collectorsAppObj = {};
	queryCollectors({connection}).hits
		.forEach(({_name: application}) => {
			collectorsAppObj[application] = true;
		});
	const collections = queryCollections({connection});
	let totalCount = 0;
	collections.hits = collections.hits.map(({
		_name: name,
		displayName,
		doCollect = false,
		collector: {
			name: collectorName = ''
		}
	}) => {
		const count = getDocumentCount(name);
		if (count) {
			totalCount += count;
		}
		return {
			name,
			displayName,
			doCollect,
			collectorName,
			count
		};
	});
	return {
		body: {
			collections,
			collectorsAppObj,
			totalCount
		},
		contentType: RT_JSON
	};
} // get
