import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_STRING,
	isSet,
	toStr
} from '@enonic/js-utils';
//import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';
import HumanDiff from 'human-object-diff';

import {execute} from '/lib/graphql';

import {SCHEMA} from '../../services/graphQL/graphQL';

import {GQL_MUTATION_DOCUMENT_TYPE_CREATE} from '../../services/graphQL/mutations/documentTypeCreateMutation.mjs';
import {GQL_MUTATION_DOCUMENT_TYPE_UPDATE} from '../../services/graphQL/mutations/documentTypeUpdateMutation.mjs';
import {GQL_MUTATION_DOCUMENT_TYPE_DELETE} from '../../services/graphQL/mutations/documentTypeDeleteMutation.mjs';
import {GQL_QUERY_DOCUMENT_TYPE_GET} from '../../services/graphQL/queries/documentTypeGetQuery.mjs';
//import {GQL_QUERY_DOCUMENT_TYPES_QUERY} from '../../services/graphQL/queries/documentTypesQuery.mjs';

import {GQL_MUTATION_FIELD_CREATE} from '../../services/graphQL/mutations/fieldCreateMutation.mjs';
import {GQL_MUTATION_FIELD_UPDATE} from '../../services/graphQL/mutations/fieldUpdateMutation.mjs';
import {GQL_MUTATION_FIELD_DELETE} from '../../services/graphQL/mutations/fieldDeleteMutation.mjs';
import {GQL_QUERY_FIELD_GET} from '../../services/graphQL/queries/fieldGetQuery.mjs';
import {GQL_QUERY_FIELDS_QUERY} from '../../services/graphQL/queries/fieldsQuery.mjs';

import {GQL_MUTATION_INTERFACE_CREATE} from '../../services/graphQL/mutations/interfaceCreateMutation.mjs';
import {GQL_MUTATION_INTERFACE_DELETE} from '../../services/graphQL/mutations/interfaceDeleteMutation.mjs';

const { diff: detailedDiff } = new HumanDiff({
	objectName: 'result'
});

function equal(expected, actual) {
	if (!deepEqual(expected, actual)) {
		log.error(`(expected != actual) expected:${toStr(expected)} actual:${toStr(actual)} diff:${toStr(detailedDiff(expected, actual))}`);
		return false;
	}
	return true;
}


function test({
	context = {},
	expected,
	query,
	variables = {}//,
}) {
	//log.debug(`Executing GQL query:${query} variables:${toStr(variables)} context:${toStr(context)}`);
	const actual = execute(SCHEMA, query, variables, context);
	if(isSet(expected)) {
		equal(expected, actual);
	}
	//log.debug(`actual:${toStr(actual)}`);
	return actual;
} // function test


export function run() {
	//──────────────────────────────────────────────────────────────────────────
	// Field Create
	//──────────────────────────────────────────────────────────────────────────
	const createFieldResult = test({
		query: GQL_MUTATION_FIELD_CREATE,
		variables: {
			// Required
			key: 'myTestFieldKey',
			// Optional
			decideByType: true,
			description: 'Description',
			enabled: true,
			fieldType: VALUE_TYPE_STRING,
			fulltext: true,
			includeInAllText: true,
			max: 0,
			min: 0,
			nGram: true,
			path: false
		}
	});
	//log.debug(`createFieldResult:${toStr(createFieldResult)}`);
	const {
		data: {
			createField: {
				_id: createdFieldId,
				_versionKey: createdFieldVersionKey
			}
		}
	} = createFieldResult;
	if (createdFieldId) {
		const createField = {
			_id: createdFieldId,
			_name: 'mytestfieldkey', // lowercased
			_nodeType: 'com.enonic.app.explorer:field',
			_path: '/fields/mytestfieldkey', // lowercased
			_versionKey: createdFieldVersionKey,
			decideByType: true,
			denyDelete: false,
			description: 'Description',
			enabled: true,
			fieldType: VALUE_TYPE_STRING,
			fulltext: true,
			includeInAllText: true,
			indexConfig: {
				decideByType: true,
				enabled: true,
				fulltext: true,
				includeInAllText: true,
				nGram: true,
				path: false
			},
			inResults: true,
			key: 'mytestfieldkey', // NOTE lowercased TODO is that ok when we allow uppercase in gui...
			max: 0,
			min: 0,
			nGram: true,
			path: false
		};
		equal({
			data: {
				createField
			}
		}, createFieldResult);

		//──────────────────────────────────────────────────────────────────────
		// Field Get
		//──────────────────────────────────────────────────────────────────────
		test({
			expected: {
				data: {
					getField: createField
				}
			},
			query: GQL_QUERY_FIELD_GET,
			variables: {
				_id: createdFieldId
			}
		});

		//──────────────────────────────────────────────────────────────────────
		// Field Update
		//──────────────────────────────────────────────────────────────────────
		const updateFieldResult = test({
			query: GQL_MUTATION_FIELD_UPDATE,
			variables: {
				// Required
				_id: createdFieldId,
				_versionKey: createdFieldVersionKey,
				// Optional
				//_name: 'myTestRenamedFieldKey', // _name is not a parameter, because it's not allowed to change key or _name
				decideByType: false,
				description: 'Changed description',
				enabled: false,
				fieldType: VALUE_TYPE_BOOLEAN,
				fulltext: false,
				includeInAllText: false,
				//key: 'myTestRenamedFieldKey', // key is not a parameter, because it's not allowed to change key or _name
				max: 1,
				min: 1,
				nGram: false,
				path: true
			}
		});
		//log.debug(`updateFieldResult:${toStr(updateFieldResult)}`);
		const {
			data: {
				updateField: {
					_versionKey: updatedFieldVersionKey
				}
			}
		} = updateFieldResult;
		equal({
			data: {
				updateField: {
					_id: createdFieldId,
					_name: 'mytestfieldkey', // lowercased
					_nodeType: 'com.enonic.app.explorer:field',
					_path: '/fields/mytestfieldkey', // lowercased
					_versionKey: updatedFieldVersionKey,
					decideByType: false,
					denyDelete: false,
					description: 'Changed description',
					enabled: false,
					fieldType: VALUE_TYPE_BOOLEAN,
					fulltext: false,
					includeInAllText: false,
					indexConfig: {
						decideByType: false,
						enabled: false,
						fulltext: false,
						includeInAllText: false,
						nGram: false,
						path: true
					},
					inResults: true,
					key: 'mytestfieldkey', // NOTE lowercased TODO is that ok when we allow uppercase in gui...
					max: 1,
					min: 1,
					nGram: false,
					path: true
				}
			}
		}, updateFieldResult);

		//──────────────────────────────────────────────────────────────────────
		// Field Query
		//──────────────────────────────────────────────────────────────────────
		test({
			query: GQL_QUERY_FIELDS_QUERY/*,
			variables: {
				fields: [],
				includeSystemFields: true
			}*/
		});

		//──────────────────────────────────────────────────────────────────────
		// Field Delete
		//──────────────────────────────────────────────────────────────────────
		test({
			expected: {
				data: {
					deleteField: {
						_id: createdFieldId
					}
				}
			},
			query: GQL_MUTATION_FIELD_DELETE,
			variables: {
				_id: createdFieldId
			}
		});
	} // if createdFieldId

	//──────────────────────────────────────────────────────────────────────────
	// DocumentType Create
	//──────────────────────────────────────────────────────────────────────────
	/*const createDocumentTypeResult = test({
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
		}*
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
