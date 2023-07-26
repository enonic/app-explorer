// import type { Headers } from '@enonic-types/lib-explorer/Request.d';

/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/
// import {
// 	NodeType,
// 	Principal
// } from '@enonic/explorer-utils';
// import {
// 	startsWith//,
// 	//toStr
// } from '@enonic/js-utils';
// import lcKeys from '@enonic/js-utils/object/lcKeys';
// import {hash} from '/lib/explorer/string/hash';
// import {connect} from '/lib/explorer/repo/connect';
// import {coerceApiKey} from '../../services/graphQL/apiKey/coerceApiKey';
// import {
// 	AUTH_PREFIX,
// 	HTTP_RESPONSE_STATUS_CODES
// } from '../constants';
// import { Node } from 'cheerio';
import createOrUpdateMany from './createOrUpdateMany';
import documentation from './documentation'
import deleteOne from './deleteOne';
import deleteMany from './deleteMany';
import getMany from './getMany';
import getOne from './getOne';
import patch from './patch';
import put from './put';
import query from './query';

// export type AllDocumentRequest = GetRequest & PostRequest & RemoveRequest;

export {
	createOrUpdateMany,
	documentation,
	deleteOne,
	deleteMany,
	getMany,
	getOne,
	patch,
	put,
	query
};

// export function all(
// 	request: AllDocumentRequest
// ) {

// 	return {
// 		status: HTTP_RESPONSE_STATUS_CODES.METHOD_NOT_ALLOWED
// 	};
// }

