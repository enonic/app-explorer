//import {toStr} from '@enonic/js-utils';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {interfaceModel} from '/lib/explorer/model/2/nodeTypes/interface';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLID,
	list
} from '/lib/graphql';
import {reference} from '/lib/xp/value';

import {
	GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
	GQL_MUTATION_INTERFACE_CREATE_NAME,
	GQL_TYPE_INTERFACE_NAME
} from '../constants';


export function addMutationInterfaceCreate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_INTERFACE_CREATE_NAME,
		args: {
			_name: glue.getScalarType('_name'),
			collectionIds: list(GraphQLID), // null allowed
			fields: list(glue.getInputType(GQL_INPUT_TYPE_INTERFACE_FIELD_NAME)), // null allowed
			stopWordIds: list(GraphQLID), // null allowed
			synonymIds: list(GraphQLID) // null allowed
		},
		resolve(env) {
			//log.debug(`env:${toStr(env)}`);
			const {
				args: {
					_name,
					collectionIds = [],
					fields = [],
					stopWordIds = [],
					synonymIds = []
				}
			} = env;
			const createdNode = create(interfaceModel({
				_name,
				collectionIds: collectionIds.map((collectionId) => reference(collectionId)), // empty array allowed
				fields: fields.map(({ // empty array allowed
					boost, // undefined allowed
					fieldId
				}) => ({
					boost,
					fieldId: reference(fieldId)
				})),
				stopWordIds: stopWordIds.map((stopWordId) => reference(stopWordId)), // empty array allowed
				synonymIds: synonymIds.map((synonymId) => reference(synonymId)) // empty array allowed
			}), {
				connection: connect({principals: [PRINCIPAL_EXPLORER_WRITE]})
			});
			//log.debug(`createdNode:${toStr(createdNode)}`);
			return coerseInterfaceType(createdNode);
		},
		type: glue.getObjectType(GQL_TYPE_INTERFACE_NAME)
	});
}
