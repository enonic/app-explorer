import {
	addQueryFilter,
	forceArray/*,
	toStr*/
} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLInt,
	newSchemaGenerator,
	nonNull,
	list
} from '/lib/graphql';

import {NT_DOCUMENT_TYPE} from './constants';
import {GQL_TYPE_DOCUMENT_TYPE} from './types';

const {
	createObjectType
} = newSchemaGenerator();


export const fieldDocumentTypesQuery = {
	resolve: () => {
		const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		const res = readConnection.query({
			count: -1,
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_DOCUMENT_TYPE])
			}),
			query: ''
		});
		//log.debug(`res:${toStr(res)}`);
		res.hits = res.hits
			.map(({id}) => readConnection.get(id))
			.map(({_id, _name, _path, _versionKey, properties}) =>
				({
					_id,
					_name,
					_path,
					_versionKey,
					properties: forceArray(properties) // GraphQL Schema doesn't ensure array
				}));
		return res;
	}, // resolve
	type: createObjectType({
		name: 'QueryDocumentType',
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: {
				type: list(GQL_TYPE_DOCUMENT_TYPE)
			}
		}
	}) // type
}; // fieldDocumentTypesQuery
