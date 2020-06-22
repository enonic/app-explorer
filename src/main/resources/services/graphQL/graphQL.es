/*import {
	createContext,
	createHeadlessCmsType
} from '/lib/guillotine';*/
import {
	createObjectType,
	createSchema,
	execute
} from '/lib/graphql';
import {toStr} from '/lib/util';


import {RT_JSON} from '/lib/explorer/model/2/constants';


import {getContentTypes} from './contentType';
import {getSites} from './site';
import {queryCollections} from './collection';
import {queryCollectors} from './collector';
import {queryFields} from './field';
import {queryInterfaces} from './interface';
import {queryStopWords} from './stopWord';


//const CONTEXT = createContext();
export const SCHEMA = createSchema({
	/*dictionary: CONTEXT.dictionary,
	query: createObjectType({
		name: 'Query',
		fields: {
			guillotine: {
				type: createHeadlessCmsType(CONTEXT),
				resolve: function () {
					return {};
				}
			}
		}
	})*/
	query: createObjectType({
		name: 'Query',
		fields: {
			getContentTypes,
			getSites,
			queryCollections,
			queryCollectors,
			queryFields,
			queryInterfaces,
			queryStopWords
		} // fields
	}) // query
}); // SCHEMA


export function post(request) {
	//log.info(`request:${toStr(request)}`);

	const {body: bodyJson} = request;
	//log.info(`bodyJson:${toStr(bodyJson)}`);

	const body = JSON.parse(bodyJson);
	//log.info(`body:${toStr(body)}`);

	const {query, variables} = body;
	log.info(`query:${toStr(query)}`);
	log.info(`variables:${toStr(variables)}`);

	return {
		contentType: RT_JSON,
		body: execute(SCHEMA, query, variables)
	};
} // post
