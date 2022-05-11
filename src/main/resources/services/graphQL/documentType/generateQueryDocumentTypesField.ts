import {
	addQueryFilter/*,
	toStr*/
} from '@enonic/js-utils';

import {coerseDocumentType} from '/lib/explorer/documentType/coerseDocumentType';
import {NT_DOCUMENT_TYPE} from '/lib/explorer/documentType/constants';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {
	list,
	reference
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_TYPE_DOCUMENT_TYPE_NAME,
	GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME
} from '../constants';


export function generateQueryDocumentTypesField({
	glue
}) {
	glue.addObjectType({
		name: GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME,
		fields: {
			count: { type: glue.getScalarType('count') },
			total: { type: glue.getScalarType('total') },
			hits: {
				type: list(reference(GQL_TYPE_DOCUMENT_TYPE_NAME))
			}
		}
	});
	return {
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
				.map(({id}) => coerseDocumentType(readConnection.get(id)));
			return res;
		}, // resolve
		type: glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME)
	};
}
