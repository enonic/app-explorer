import {
	isNotSet,
	isNotTrue//,
	//toStr
} from '@enonic/js-utils';

import {coerseFieldType} from '/lib/explorer/field/coerseFieldType';
import {getFields} from '/lib/explorer/field/getFields';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLBoolean,
	GraphQLString,
	list
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
		resolve: (env) => {
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

			fieldsRes.hits = fieldsRes.hits.map(hit => coerseFieldType(hit));
			//log.debug(`mapped fieldsRes:${toStr(fieldsRes)}`);

			// WARNING The context is a global read-only, you can't use it to pass data.
			//context.hits = fieldsRes.hits.map(({key}) => ({key}));

			return fieldsRes;
		},
		type: glue.getObjectType(GQL_TYPE_FIELDS_QUERY_RESULT_NAME)
	};
}
