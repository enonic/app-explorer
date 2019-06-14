import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/interface/query';


export function get() {
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const interfaces = query({connection});
	interfaces.hits = interfaces.hits.map(({_name: name, displayName}) => ({displayName, name}));
	return {
		body: interfaces,
		contentType: RT_JSON
	};
}
