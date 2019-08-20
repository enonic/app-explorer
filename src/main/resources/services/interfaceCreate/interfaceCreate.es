import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {interfaceModel} from '/lib/explorer/model/2/nodeTypes/interface';


export function post({
	params: {
		json
	}
}) {
	const obj = JSON.parse(json);
	obj.__connection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]}); // eslint-disable-line no-underscore-dangle
	obj._name = obj.name;
	obj.displayName = obj.name;
	const node = create(interfaceModel(obj));
	const body = {};
	let status = 200;
	if (node) {
		body.message = `Interface ${obj.name} created.`
	} else {
		body.error = `Something went wrong when trying to create interface ${obj.name}!`
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
