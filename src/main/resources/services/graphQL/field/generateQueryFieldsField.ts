import {
	isNotSet,
	isNotTrue//,
	//toStr
} from '@enonic/js-utils';

import {getFields} from '/lib/explorer/field/getFields';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLBoolean,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';

import {GQL_TYPE_FIELDS_QUERY_RESULT_NAME} from '../constants';


export function generateQueryFieldsField({
	glue
}) {
	return {
		args: {
			fields: list(GraphQLString), // optional, undefined means "all fields"
			includeSystemFields: GraphQLBoolean // optional, defaults to false
		},
		resolve: (env :{
			args: {
				fields :Array<string>
				includeSystemFields :boolean
			}
		}) => {
			//log.info(`env:${toStr(env)}`);

			const {args/*, context*/} = env;
			//log.info(`args:${toStr(args)}`);

			let {
				fields,
				includeSystemFields // GraphQL passes null, so defaults are bypassed :(
			} = args;
			// GraphQL passes null, so defaults are bypassed :(
			if (isNotSet(fields)) { fields = []; }
			if (isNotTrue(includeSystemFields)) { includeSystemFields = false; }
			//log.info(`fields:${toStr(fields)}`);

			const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

			const fieldsRes = getFields({
				connection,
				fields,
				includeSystemFields
			});
			//log.debug(`fieldsRes:${toStr(fieldsRes)}`);

			return fieldsRes;
		},
		type: glue.getObjectType(GQL_TYPE_FIELDS_QUERY_RESULT_NAME)
	};
}
