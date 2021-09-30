import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {referencedBy} from '/lib/explorer/node/referencedBy';
import {connect} from '/lib/explorer/repo/connect';


export function referencedByMapped({
	_id,
	count = -1,
	filters = {},
	start
}) {
	const res = referencedBy({
		_id,
		boolGetNode: true,
		connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] }),
		count,
		filters,
		start
	});

	// Limit what is exposed
	res.hits = res.hits.map(({
		_id,
		_name,
		_nodeType,
		_path,
		_score
	}) => ({
		_id,
		_name,
		_nodeType,
		_path,
		_score
	}));

	return res;
}
