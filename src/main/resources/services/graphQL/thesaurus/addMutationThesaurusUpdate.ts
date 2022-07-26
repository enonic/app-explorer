//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
import {GQL_TYPE_THESAURUS_NAME} from '../constants';


export function addMutationThesaurusUpdate({
	glue
}) {
	glue.addMutation({
		name: 'updateThesaurus',
		args: {
			_id: glue.getScalarType('_id'),
			_name: glue.getScalarType('_name'),
			allowedLanguages: list(GraphQLString)
		},
		resolve({
			args: {
				_id,
				_name,
				allowedLanguages
			}
		}) {
			const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
			const oldNode = writeConnection.get(_id);
			if (!oldNode) {
				const msg = `Could not find thesaurus with id:${_id}!`;
				log.error(msg);
				throw new Error(msg);
			}
			const {
				_name: oldName
			} = oldNode;
			if (_name !== oldName) {
				const boolMovedorRenamed = writeConnection.move({

					// Path or id of the node to be moved or renamed
					source: _id,

					// New path or name for the node. If the target ends in slash '/',
					// it specifies the parent path where to be moved.
					// Otherwise it means the new desired path or name for the node.
					target: _name

				}); // NOTE: Will throw if _path already occupied :)
				if (boolMovedorRenamed) {
					//log.debug(`Moved/renamed id:${_id} from oldName:${oldName} to name:${_name}`);
					writeConnection.refresh();
				} else {
					const msg = `Something went wrong when trying to move/rename id:${_id} from oldName:${oldName} to name:${_name}`;
					log.error(msg);
					throw new Error(msg);
				}
			}
			// TODO Diff?
			const modifiedNode = writeConnection.modify<{
				allowedLanguages: Array<string>
			}>({
				key: _id,
				editor: (node) => {
					node.allowedLanguages = allowedLanguages;
					return node;
				}
			});
			//log.debug(`modifiedNode:${toStr(modifiedNode)}`);
			writeConnection.refresh();
			return modifiedNode;
		},
		type: glue.getObjectType(GQL_TYPE_THESAURUS_NAME)
	});
}
