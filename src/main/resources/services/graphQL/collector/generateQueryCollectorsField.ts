//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {queryCollectors} from './queryCollectors';


export function generateQueryCollectorsField({
	glue
}) {
	const COLLECTOR_OBJECT_TYPE = glue.addObjectType({
		name: 'Collector',
		//description:
		fields: {

			// TODO: These can be null until removed
			// We're not registering collectors as nodes anymore.
			//_id: { type: (GraphQLString) },
			//_name: { type: (GraphQLString) },
			//_nodeType: { type: GraphQLString },
			//_path: { type: (GraphQLString) },

			appName: { type: nonNull(GraphQLString) },
			taskName: { type: nonNull(GraphQLString) },
			componentPath: { type: nonNull(GraphQLString) },
			configAssetPath: { type: nonNull(GraphQLString) },
			displayName: { type: nonNull(GraphQLString) }//,
			//type: { type: nonNull(GraphQLString) }
		}
	}); // COLLECTOR_OBJECT_TYPE

	return {
		resolve: (/*env*/) => {
			//log.info(`env:${toStr(env)}`);
			return queryCollectors();
		},
		type: glue.addObjectType({
			name: 'QueryCollectors',
			//description:
			fields: {
				total: { type: nonNull(GraphQLInt) },
				count: { type: nonNull(GraphQLInt) },
				/*page: { type: nonNull(GraphQLInt) },
				pageStart: { type: nonNull(GraphQLInt) },
				pageEnd: { type: nonNull(GraphQLInt) },
				pagesTotal: { type: nonNull(GraphQLInt) },*/
				hits: { type: list(COLLECTOR_OBJECT_TYPE) }
			} // fields
		})
	};
}

/* Example query
{
	queryCollectors {
		total
		count
		hits {
			#_id
			#_name
			#_nodeType
			#_path
			appName
			taskName
			configAssetPath
			displayName
			#type
		}
	}
}
*/
