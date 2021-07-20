//import {toStr} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {fieldValue} from '/lib/explorer/model/2/nodeTypes/fieldValue';
import {createOrModify} from '/lib/explorer/node/createOrModify';
import {getReference} from '/lib/explorer/node/getReference';
import {connect} from '/lib/explorer/repo/connect';
import {ucFirst} from '/lib/explorer/ucFirst';


export function post({params: {
	field,
	value,
	displayName = ucFirst(value)
}}) {
	const connection = connect({principals: PRINCIPAL_EXPLORER_WRITE});
	const nodeParams = fieldValue({
		displayName,
		field,
		fieldReference: getReference({
			connection,
			path: `/fields/${field}`
		}),
		value
	});
	const node = createOrModify(nodeParams, {
		connection
	});

	let body = {
		message: `Value ${value} for field ${field} created.`
	};
	let status = 200;

	if (!node) {
		body = {
			error: `Something went wrong when trying to create value ${value} for field ${field}.`
		};
		status = 500;
	}

	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
