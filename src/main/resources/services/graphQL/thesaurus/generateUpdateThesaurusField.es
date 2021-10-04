//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLString,
	nonNull
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_THESAURUS_LANGUAGE_NAME,
	GQL_TYPE_THESAURUS_NAME
} from '../constants';


export function generateUpdateThesaurusField({
	glue
}) {
	return {
		args: {
			_id: nonNull(GraphQLString),
			_name: nonNull(GraphQLString),
			language: glue.getInputType(GQL_INPUT_TYPE_THESAURUS_LANGUAGE_NAME)
		},
		resolve({
			args: {
				_id,
				_name,
				language
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
					log.debug(`Moved/renamed id:${_id} from oldName:${oldName} to name:${_name}`);
					writeConnection.refresh();
				} else {
					const msg = `Something went wrong when trying to move/rename id:${_id} from oldName:${oldName} to name:${_name}`;
					log.error(msg);
					throw new Error(msg);
				}
			}
			// TODO Diff?
			const modifiedNode = writeConnection.modify({
				key: _id,
				editor: (node) => {
					node.language = language;
					return node;
				}
			});
			//log.debug(`modifiedNode:${toStr(modifiedNode)}`);
			writeConnection.refresh();
			return modifiedNode;
		},
		type: glue.getObjectType(GQL_TYPE_THESAURUS_NAME)
	};
}
