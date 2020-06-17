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
import {toStr} from '/lib/util';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFields} from '/lib/explorer/field/getFields';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';


const FIELD_OBJECT_TYPE = createObjectType({
	name: 'Field',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_path: { type: nonNull(GraphQLString) },
		denyDelete: { type: GraphQLBoolean },
		denyValues: { type: GraphQLBoolean },
		displayName: { type: nonNull(GraphQLString) },
		indexConfig: { type: nonNull(GraphQLString) },
		inResults: { type: GraphQLBoolean },
		fieldType: { type: nonNull(GraphQLString) },
		key: { type: nonNull(GraphQLString) },
		type: { type: nonNull(GraphQLString) }
	}
});


export const queryFields = {
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		//const fields = {};
		const fieldValues = {};
		getFieldValues({connection}).hits.forEach(({
			_name: name,
			_path: path,
			displayName: label,
			field
		}) => {
			if (!fieldValues[field]) {fieldValues[field] = {}}
			fieldValues[field][name] = {
				label,
				path
			};
		});
		log.info(`fieldValues:${toStr(fieldValues)}`);

		const fieldsRes = getFields({connection});
		log.info(`fieldsRes:${toStr(fieldsRes)}`);

		fieldsRes.hits = fieldsRes.hits.map(({
			_id,
			_path,
			_name,
			denyDelete,
			denyValues,
			displayName,
			indexConfig,
			inResults,
			fieldType,
			key,
			type
		}) => ({
			_id,
			_path,
			_name,
			denyDelete,
			denyValues,
			displayName,
			indexConfig,
			inResults,
			fieldType,
			key,
			type
		}));
		log.info(`mapped fieldsRes:${toStr(fieldsRes)}`);

		/*fieldsRes.hits.forEach(({
			_path: path,
			displayName: label,
			key: field
		}) => {
			fields[field] = {
				label,
				path,
				values: fieldValues[field]
			};
		});
		log.info(`fields:${toStr(fields)}`);*/
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
			_path
			_name
			denyDelete
			denyValues
			displayName
			indexConfig
			inResults
			fieldType
			key
			type
		}
	}
}
*/
