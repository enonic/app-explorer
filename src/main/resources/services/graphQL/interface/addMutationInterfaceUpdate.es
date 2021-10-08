import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {interfaceModel} from '/lib/explorer/model/2/nodeTypes/interface';
import {modify} from '/lib/explorer/node/modify';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLID,
	GraphQLString,
	list
} from '/lib/graphql';
//import {reference} from '/lib/xp/value';

import {
	GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
	GQL_MUTATION_INTERFACE_UPDATE_NAME,
	GQL_TYPE_INTERFACE_NAME
} from '../constants';


export function addMutationInterfaceUpdate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_INTERFACE_UPDATE_NAME,
		args: {
			_id: glue.getScalarType('_id'),
			_name: glue.getScalarType('_name'),
			collectionIds: list(GraphQLID), // null allowed
			fields: list(glue.getInputType(GQL_INPUT_TYPE_INTERFACE_FIELD_NAME)), // null allowed
			//stopWordIds: list(GraphQLID), // null allowed
			stopWords: list(GraphQLString), // null allowed
			//synonymIds: list(GraphQLID) // null allowed
			synonyms: list(GraphQLString) // null allowed
		},
		resolve(env) {
			//log.debug(`env:${toStr(env)}`);
			const {
				args: {
					_id,
					_name,
					collectionIds = [],
					fields = [],
					//stopWordIds = [],
					stopWords = [],
					//synonymIds = []
					synonyms = []
				}
			} = env;
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});
			const origNode = writeConnection.get(_id);
			if (!origNode) {
				throw new Error(`Could not get original interface node to modify! _id:${_id}`);
			}
			if (_name !== origNode._name) { // _name changed
				const moveParams = {
					source: origNode._path,
					target: _name
				};
				//log.info(`moveParams:${toStr({moveParams})}`);
				const boolMoved = writeConnection.move(moveParams);
				if (!boolMoved) {
					throw new Error(`Unable to rename interface from ${origNode._name} to ${_name}!`);
				}
			}
			const modifiedNode = modify(interfaceModel({
				_name,
				collectionIds: forceArray(collectionIds),
				fields: forceArray(fields).map(({ // empty array allowed
					boost, // undefined allowed
					//fieldId,
					name
				}) => ({
					boost,
					//fieldId: reference(fieldId),
					name
				})),
				//stopWordIds: stopWordIds.map((stopWordId) => reference(stopWordId)), // empty array allowed
				stopWords: forceArray(stopWords),
				//synonymIds: synonymIds.map((synonymId) => reference(synonymId)) // empty array allowed
				synonyms: forceArray(synonyms)
			}), {
				connection: writeConnection
			});
			return coerseInterfaceType(modifiedNode);
		},
		type: glue.getObjectType(GQL_TYPE_INTERFACE_NAME)
	});
}
