import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	DEFAULT_INTERFACE_FIELDS,
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {jsonError} from '/lib/explorer/jsonError';
import {get as getInterface} from '/lib/explorer/interface/get';
import {connect} from '/lib/explorer/repo/connect';


export function get({
	params: {
		id: key
		//name: interfaceName
	}
}) {
	if (!key) {
		return jsonError('Missing required parameter id!');
	}
	//log.info(`key:${key}`);
	const iFace = getInterface({
		connection: connect({principals: [PRINCIPAL_EXPLORER_READ]}),
		key
		//interfaceName
	});
	//log.info(`iFace:${toStr(iFace)}`);

	const {
		_id: id,
		_name,
		collections = [], // Just collection names, not collection nodes
		displayName = '',
		fields = DEFAULT_INTERFACE_FIELDS,
		name = '',
		stopWords = [],
		synonyms = []
	} = iFace;
	const body = {
		collections: forceArray(collections), // Just collection names, not collection nodes
		displayName,
		id,
		_name,
		fields: forceArray(fields),
		name,
		stopWords: forceArray(stopWords),
		synonyms: forceArray(synonyms)
	};
	//log.info(`body:${toStr(body)}`);

	return {
		body,
		contentType: RT_JSON
	};
} // function get
