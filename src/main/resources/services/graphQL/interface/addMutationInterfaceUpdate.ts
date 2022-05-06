import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {update} from '/lib/explorer/interface/update';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLID,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';

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
			synonymIds: list(GraphQLID) // null allowed
		},
		resolve(env :{
			args :{
				_id :string
				_name :string
				collectionIds ?:Array<string>
				fields ?:Array<{
					boost ?:number
					name :string
				}>
				stopWords ?:Array<string>
				synonymIds ?:Array<string>
			}
		}) {
			//log.debug(`env:${toStr(env)}`);
			const {
				args: {
					_id,
					_name,
					collectionIds = [],
					fields = [],
					//stopWordIds = [],
					stopWords = [],
					synonymIds = []
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
			const modifiedNode = update({ // Model applies forceArray and reference
				_id,
				collectionIds,
				fields,
				//stopWordIds, // empty array allowed
				stopWords,
				synonymIds // empty array allowed
			}, {
				writeConnection
			});
			return coerseInterfaceType(modifiedNode);
		},
		type: glue.getObjectType(GQL_TYPE_INTERFACE_NAME)
	});
}
