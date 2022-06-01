//import {toStr} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {queryDocumentTypes} from '/lib/explorer/documentType/queryDocumentTypes';
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
		resolve: () => queryDocumentTypes({
			readConnection: connect({ principals: [PRINCIPAL_EXPLORER_READ] })
		}),
		type: glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME)
	};
}
