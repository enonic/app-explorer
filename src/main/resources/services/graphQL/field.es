//import {toStr} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFields} from '/lib/explorer/field/getFields';

const {
	createObjectType
} = newSchemaGenerator();


const FIELD_OBJECT_TYPE = createObjectType({
	name: 'Field',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		denyDelete: { type: GraphQLBoolean },
		//displayName: { type: nonNull(GraphQLString) },
		indexConfig: { type: nonNull(GraphQLString) },
		inResults: { type: GraphQLBoolean },
		fieldType: { type: nonNull(GraphQLString) },
		key: { type: nonNull(GraphQLString) }//,
		//type: { type: nonNull(GraphQLString) },
	}
});


export const queryFields = {
	args: {
		fields: list(GraphQLString)
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);

		const {args} = env;
		//log.info(`args:${toStr(args)}`);

		const {fields} = args;
		//log.info(`fields:${toStr(fields)}`);

		const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

		const fieldsRes = getFields({
			connection,
			fields
		});
		//log.info(`fieldsRes:${toStr(fieldsRes)}`);

		fieldsRes.hits = fieldsRes.hits.map(({
			_id,
			_name,
			_nodeType,
			_path,
			denyDelete,
			//displayName,
			indexConfig,
			inResults,
			fieldType,
			key//,
			//type
		}) => ({
			_id,
			_name,
			_nodeType,
			_path,
			denyDelete,
			//displayName,
			indexConfig,
			inResults,
			fieldType,
			key//,
			//type
		}));
		//log.info(`mapped fieldsRes:${toStr(fieldsRes)}`);

		return fieldsRes;
	},
	type: createObjectType({
		name: 'QueryFields',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			/*page: { type: nonNull(GraphQLInt) },
			pageStart: { type: nonNull(GraphQLInt) },
			pageEnd: { type: nonNull(GraphQLInt) },
			pagesTotal: { type: nonNull(GraphQLInt) },*/
			hits: { type: list(FIELD_OBJECT_TYPE) }
		} // fields
	})
}; // queryFields


/* Example query
{
	queryFields {
		total
		count
		hits {
			_id
			_name
			_nodeType
			_path
			denyDelete
			#displayName
			indexConfig
			inResults
			fieldType
			key
			#type
		}
	}
}
*/
