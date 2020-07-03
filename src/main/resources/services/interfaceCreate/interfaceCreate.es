import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {interfaceModel} from '/lib/explorer/model/2/nodeTypes/interface';
import {jsonError} from '/lib/explorer/jsonError';


export function post({
	params: {
		json
	}
}) {
	if (!json) {
		return jsonError('Missing required parameter json!');
	}
	const obj = JSON.parse(json);
	obj.__connection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]}); // eslint-disable-line no-underscore-dangle
	obj._name = obj.displayName;
	const node = create(interfaceModel(obj)); // This will sanitize _name
	const body = {};
	let status = 200;
	if (node) {
		body.message = `Interface ${obj._name} created.`
	} else {
		body.error = `Something went wrong when trying to create interface ${obj._name}!`
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
