import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';
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
		collector: {
			name: collectorName = ''
		},
		cron,
		displayName,
		doCollect = false,
		//_id: id,
		_name: name
	}) => {
		const count = getDocumentCount(name);
		if (count) {
			totalCount += count;
		}
		return {
			collectorName,
			count,
			cron,
			displayName,
			doCollect,
			//id,
			interfaces: usedInInterfaces({connection, name}),
			name
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
