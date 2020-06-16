import {
	createContext,
	createHeadlessCmsType
} from '/lib/guillotine';
import {
	createObjectType,
	createSchema,
	execute,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {toStr} from '/lib/util';


import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryCollections} from '/lib/explorer/collection/query';



const COLLECTION_OBJECT_TYPE = createObjectType({
	name: 'Collection',
	description: 'Collection description',
	fields: {
		id: { type: nonNull(GraphQLString) }
	}
});


const CONTEXT = createContext();
const SCHEMA = createSchema({
	/*creationCallbacks: {
		'com_enonic_app_explorer': (context, params) => {
			params.fields.collections = {
				resolve: (env) => {
					log.info(`env:${toStr(env)}`);
					return 'ComLock';
				},
				type: GraphQLString
			}
		}
	},
	dictionary: CONTEXT.dictionary,
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
			collections: {
				resolve: (env) => {
					log.info(`env:${toStr(env)}`);
					const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
					const collectionsRes = queryCollections({
						connection
					});
					log.info(`collectionsRes:${toStr(collectionsRes)}`);
					return collectionsRes.hits.map(({_id: id}) => ({id}));
				},
				type: list(COLLECTION_OBJECT_TYPE)
			} // collections
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
