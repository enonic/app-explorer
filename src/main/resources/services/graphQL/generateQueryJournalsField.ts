//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {coerceJournalType} from '/lib/explorer/journal/coerceJournalType';
import {query} from '/lib/explorer/journal/query';


export function generateQueryJournalsField({
	glue
}) {
	const JOURNAL_OBJECT_TYPE = glue.addObjectType({
		name: 'Journal',
		//description:
		fields: {
			_id: { type: glue.getScalarType('_id') },
			_name: { type: glue.getScalarType('_name') },
			//_nodeType: { type: GraphQLString }, // No point in exposing, always the same
			_path: { type: glue.getScalarType('_path') },
			_versionKey: { type: glue.getScalarType('_versionKey') },
			displayName: { type: nonNull(GraphQLString) },
			endTime: { type: nonNull(GraphQLString) },
			errorCount: { type: nonNull(GraphQLInt) },
			errors: { type: list(glue.addObjectType({
				name: 'JournalErrors',
				//description:
				fields: {
					message: { type: GraphQLString },
					uri: { type: GraphQLString }
				}
			}))},
			duration: { type: nonNull(GraphQLInt) },
			name: { type: nonNull(GraphQLString) },
			startTime: { type: nonNull(GraphQLString) },
			successCount: { type: nonNull(GraphQLInt) },
			successes: { type: list(glue.addObjectType({
				name: 'JournalSuccesses',
				//description:
				fields: {
					message: { type: GraphQLString },
					uri: { type: GraphQLString }
				}
			}))}//,
			//type: { type: nonNull(GraphQLString) }
		}
	}); // JOURNAL_OBJECT_TYPE
	return {
		args: {
			//aggregations
			count: GraphQLInt,
			//filters
			//query
			//page: GraphQLInt,
			//perPage: GraphQLInt,
			sort: GraphQLString,
			start: GraphQLInt
		},
		resolve: (env :{
			args :{
				count ?:number
				sort ?:string
				start ?:number
			}
		}) => {
			//log.info(`env:${toStr(env)}`);
			const qr = query(env.args);
			//log.info(`journalsRes:${toStr(qr)}`);
			const graph = {
				count: qr.count,
				hits: qr.hits.map((hit) => coerceJournalType(hit)),
				total: qr.total
			};
			//log.debug(`journalsRes:${toStr(graph)}`);
			return graph;
		},
		type: glue.addObjectType({
			name: 'QueryJournals',
			//description:
			fields: {
				count: { type: glue.getScalarType('count') },
				//page: { type: GraphQLInt },
				//pageStart: { type: GraphQLInt },
				//pageEnd: { type: GraphQLInt },
				//pagesTotal: { type: GraphQLInt },
				hits: { type: list(JOURNAL_OBJECT_TYPE) },
				total: { type: glue.getScalarType('total') }
			} // fields
		})
	}; // queryJournals
}

/* Example query
{
	queryJournals(
		#aggregations
		count: -1
		#filters
		#page: 1
		#perPage: 1
		#query
		sort: "endTime DESC"
		start: 0
	) {
		total
		count
		page
		pageStart
		pageEnd
		pagesTotal
		hits {
			_id
			_name
			_nodeType
			_path
			displayName
			endTime
			errorCount
			errors {
				message
				uri
			}
			duration
			name
			startTime
			successCount
			successes {
				message
				uri
			}
			#type
		}
	}
}
*/
