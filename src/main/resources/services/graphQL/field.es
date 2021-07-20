//import {toStr} from '@enonic/js-utils';

import {
	//createInputObjectType,
	createObjectType,
	GraphQLBoolean,
	//GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFields} from '/lib/explorer/field/getFields';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';

const FIELD_VALUE_OBJECT_TYPE = createObjectType({
	name: 'FieldValue',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) },
		field: { type: nonNull(GraphQLString) },
		fieldReference: { type: nonNull(GraphQLString) },
		//type: { type: nonNull(GraphQLString) },
		value: { type: GraphQLString } // Found to be null in prod :(
	}
});


const FIELD_OBJECT_TYPE = createObjectType({
	name: 'Field',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		denyDelete: { type: GraphQLBoolean },
		denyValues: { type: GraphQLBoolean },
		//displayName: { type: nonNull(GraphQLString) },
		indexConfig: { type: nonNull(GraphQLString) },
		inResults: { type: GraphQLBoolean },
		fieldType: { type: nonNull(GraphQLString) },
		key: { type: nonNull(GraphQLString) },
		//type: { type: nonNull(GraphQLString) },
		values: { type: list(FIELD_VALUE_OBJECT_TYPE)}
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

		const fieldValuesRes = getFieldValues({
			connection,
			field: fields
		});
		//log.info(`fieldValuesRes:${toStr(fieldValuesRes)}`);

		const fieldValuesObjArr = {};
		fieldValuesRes.hits.forEach(({
			_id,
			_name,
			_nodeType,
			_path,
			displayName,
			field,
			fieldReference,
			//type,
			value
		}) => {
			if (!fieldValuesObjArr[field]) {fieldValuesObjArr[field] = [];}
			fieldValuesObjArr[field].push({
				_id,
				_name,
				_nodeType,
				_path,
				displayName,
				field,
				fieldReference,
				//type,
				value
			});
		}); // forEach fieldValue
		//log.info(`fieldValuesObjArr:${toStr(fieldValuesObjArr)}`);

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
			denyValues,
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
			denyValues,
			//displayName,
			indexConfig,
			inResults,
			fieldType,
			key,
			//type,
			values: fieldValuesObjArr[_name]
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
			denyValues
			#displayName
			indexConfig
			inResults
			fieldType
			key
			#type
			values {
				_id
				_name
				_path
				displayName
				field
				fieldReference
				type
				value
			}
		}
	}
}
*/
