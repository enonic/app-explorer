import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {query as queryCollections} from '/lib/explorer/collection/query';
import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {interfaceModel} from '/lib/explorer/model/2/nodeTypes/interface';
import {jsonError} from '/lib/explorer/jsonError';
import {reference} from '/lib/xp/value';

export function post({
	body: json
}) {
	if (!json) {
		return jsonError('Empty body!');
	}
	const obj = JSON.parse(json);
	//log.info(`obj:${toStr(obj)}`);

	obj._name = obj.displayName;

	const connection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});

	const collectionsNameToId = {};
	queryCollections({
		connection,
		count: -1
	}).hits.forEach(({_id, _name}) => {
		collectionsNameToId[_name] = _id;
	});
	obj.collectionIds = [];
	forceArray(obj.collections).forEach((collectionName) => {
		const collectionId = collectionsNameToId[collectionName];
		if (collectionId) {
			obj.collectionIds.push(reference(collectionId));
		} else {
			log.error(`Unable to find collectionId for collectionName:${collectionName}`);
		}
	});

	const node = create(interfaceModel(obj), {
		connection
	}); // This will sanitize _name
	const body = {};
	let status = 200;
	if (node) {
		body.message = `Interface ${obj._name} created.`;
	} else {
		body.error = `Something went wrong when trying to create interface ${obj._name}!`;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post
