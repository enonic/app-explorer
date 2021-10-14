import {
	isSet,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

import {execute} from '/lib/graphql';

import {SCHEMA} from '../../services/graphQL/graphQL';

import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../../services/graphQL/mutations/documentTypeCreateMutation.mjs';
import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../../services/graphQL/mutations/documentTypeUpdateMutation.mjs';
import {GQL_MUTATION_DOCUMENT_TYPE_DELETE} from '../../services/graphQL/mutations/documentTypeDeleteMutation.mjs';
import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../../services/graphQL/queries/documentTypeGetQuery.mjs';
//import {GQL_QUERY_DOCUMENT_TYPES_QUERY} from '../../services/graphQL/queries/documentTypesQuery.mjs';

import {GQL_MUTATION_INTERFACE_CREATE} from '../../services/graphQL/mutations/interfaceCreateMutation.mjs';
import {GQL_MUTATION_INTERFACE_DELETE} from '../../services/graphQL/mutations/interfaceDeleteMutation.mjs';


function equal(expected, actual) {
	if (!deepEqual(expected, actual)) {
		log.error(`(expected != actual) expected:${toStr(expected)} actual:${toStr(actual)} diff:${toStr(detailedDiff(expected, actual))}`);
		return false;
	}
	return true;
}


function test({
	context = {},
	//expected,
	query,
	variables = {}//,
}) {
	//log.debug(`Executing GQL query:${query} variables:${toStr(variables)} context:${toStr(context)}`);
	const actual = execute(SCHEMA, query, variables, context);
	/*if(isSet(expected)) {
		equal(expected, actual);
	}*/
	//log.debug(`actual:${toStr(actual)}`);
	return actual;
} // function test


export function run() {

	//──────────────────────────────────────────────────────────────────────────
	// DocumentType Create
	//──────────────────────────────────────────────────────────────────────────
	const createDocumentTypeResult = test({
		query: GQL_MUTATION_DOCUMENT_TYPE_CREATE,
		variables: {
			_name: 'myTestDocumentTypeName'//,
			//addFields: true
			//fields: []
			//properties: []
		}
	});
	//log.debug(`createDocumentTypeResult:${toStr(createDocumentTypeResult)}`);

	const { data: {
		createDocumentType: {
			_id: createdDocumentTypeId,
			_versionKey: createdDocumentTypeVersionKey
		}
	}} = createDocumentTypeResult;
	if (equal({
		data: {
			createDocumentType: {
				_id: createdDocumentTypeId,
				_name: 'myTestDocumentTypeName',
				_nodeType: 'com.enonic.app.explorer:documentType',
				_path: '/documentTypes/myTestDocumentTypeName',
				_versionKey: createdDocumentTypeVersionKey,
				addFields: true,
				fields: [],
				properties: []
			}
		}
	}, createDocumentTypeResult)) {

		//──────────────────────────────────────────────────────────────────────
		// DocumentType Get
		//──────────────────────────────────────────────────────────────────────
		const getDocumentTypeResult = test({
			query: GQL_QUERY_DOCUMENT_TYPE_GET,
			variables: {
				_id: createdDocumentTypeId
			}
		});
		equal({
			data: {
				getDocumentType: {
					_id: createdDocumentTypeId,
					_name: 'myTestDocumentTypeName',
					_nodeType: 'com.enonic.app.explorer:documentType',
					_path: '/documentTypes/myTestDocumentTypeName',
					_versionKey: createdDocumentTypeVersionKey,
					addFields: true,
					fields: [],
					properties: [],
					__referencedBy: {
						count: 0,
						hits: [],
						total: 0
					}
				}
			}
		}, getDocumentTypeResult);

		//──────────────────────────────────────────────────────────────────────
		// DocumentType Update
		//──────────────────────────────────────────────────────────────────────
		const updateDocumentTypeResult = test({
			query: GQL_MUTATION_DOCUMENT_TYPE_UPDATE,
			variables: {
				_id: createdDocumentTypeId,
				_name: 'myRenamedTestDocumentTypeName',
				_versionKey: createdDocumentTypeVersionKey,
				addFields: false
				//fields: []
				//properties: []
			}
		});
		//log.debug(`updateDocumentTypeResult:${toStr(updateDocumentTypeResult)}`);
		const {
			data: {
				updateDocumentType: {
					_versionKey: updatedDocumentTypeVersionKey
				}
			}
		} = updateDocumentTypeResult;
		equal({
			data: {
				updateDocumentType: {
					_id: createdDocumentTypeId,
					_name: 'myRenamedTestDocumentTypeName',
					_nodeType: 'com.enonic.app.explorer:documentType',
					_path: '/documentTypes/myRenamedTestDocumentTypeName',
					_versionKey: updatedDocumentTypeVersionKey,
					addFields: false,
					fields: [],
					properties: []
				}
			}
		}, updateDocumentTypeResult);

		//──────────────────────────────────────────────────────────────────────
		// DocumentType Delete
		//──────────────────────────────────────────────────────────────────────
		const deleteDocumentTypeResult = test({
			query: GQL_MUTATION_DOCUMENT_TYPE_DELETE,
			variables: {
				_id: createdDocumentTypeId
			}
		});
		//log.debug(`deleteDocumentTypeResult:${toStr(deleteDocumentTypeResult)}`);
		equal({
			data: {
				deleteDocumentType: {
					_id: createdDocumentTypeId
				}
			}
		}, deleteDocumentTypeResult);

		//──────────────────────────────────────────────────────────────────────
		// DocumentType Get (after delete)
		//──────────────────────────────────────────────────────────────────────
		/*try {
			test({
				query: GQL_QUERY_DOCUMENT_TYPE_GET,
				variables: {
					_id: createdDocumentTypeId
				}
			});
		} catch (error) {
			const expected = {
				class: 'com.enonic.xp.resource.ResourceProblemException',
				message: `Unable to get documentType with _id:${createdDocumentTypeId}!`
			};
			if (
				error.class !== expected.class
				|| error.message !== expected.message
			) {
				log.error(`Wrong error thrown! Expected:${toStr(expected)} Got:`, error);
			}
		}*/
	} // if created
	/*test({
		query: GQL_QUERY_DOCUMENT_TYPES_QUERY
	});*/

	/*const createInterfaceResult = test({
		query: GQL_MUTATION_INTERFACE_CREATE,
		variables: {
			_name: 'myTestInterfaceName',
			collectionIds: [],
			fields: [],
			stopWords: [],
			synonymIds: []
		}
	});
	//log.debug(`createInterfaceResult:${toStr(createInterfaceResult)}`);
	const { data: {
		createInterface: {
			_id: createdInterfaceId,
			_versionKey: createdInterfaceVersionKey
		}
	}} = createInterfaceResult;
	if (equal({
		data: {
			createInterface: {
				_id: createdInterfaceId,
				_name: 'mytestinterfacename', // NOTE Currently gets lowercased
				_nodeType: 'com.enonic.app.explorer:interface',
				_path: '/interfaces/mytestinterfacename',
				_versionKey: createdInterfaceVersionKey,
				collectionIds: [],
				fields: [],
				stopWords: [],
				synonymIds: []
			}
		}
	}, createInterfaceResult)) {
		const deleteInterFaceResult = test({
			query: GQL_MUTATION_INTERFACE_DELETE,
			variables: {
				_id: createdInterfaceId
			}
		});
		//log.debug(`deleteInterFaceResult:${toStr(deleteInterFaceResult)}`);
		equal({
			data: {
				deleteInterface: {
					_id: createdInterfaceId
				}
			}
		}, deleteInterFaceResult);
	}*/
}
