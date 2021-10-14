import {
	isSet,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

import {execute} from '/lib/graphql';

import {SCHEMA} from '../../services/graphQL/graphQL';
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
	expected,
	query,
	variables = {}//,
}) {
	log.debug(`Executing GQL query:${query} variables:${toStr(variables)} context:${toStr(context)}`);
	const actual = execute(SCHEMA, query, variables, context);
	if(isSet(expected)) {
		equal(expected, actual);
	}
	//log.debug(`actual:${toStr(actual)}`);
	return actual;
} // function test


export function run() {
	const createInterfaceResult = test({
		query: GQL_MUTATION_INTERFACE_CREATE,
		variables: {
			_name: 'myTestName',
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
			_versionKey
		}
	}} = createInterfaceResult;
	if (equal({
		data: {
			createInterface: {
				_id: createdInterfaceId,
				_name: 'mytestname', // NOTE Currently gets lowercased
				_nodeType: 'com.enonic.app.explorer:interface',
				_path: '/interfaces/mytestname',
				_versionKey,
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
	}
	/*test({
		query: GQL_QUERY_DOCUMENT_TYPES_QUERY
	});*/
}
