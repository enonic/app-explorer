import type {SynonymNode} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';


import {toStr} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {get} from '/lib/explorer/node/get';
import {connect} from '/lib/explorer/repo/connect';
import {coerceSynonymType} from '/lib/explorer/synonym/coerceSynonymType';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
	GQL_TYPE_SYNONYM_NAME
} from '../constants';


export function addMutationSynonymUpdate({
	glue
} :{
	glue :Glue
}) {
	glue.addMutation({
		name: 'updateSynonym',
		args: {
			_id: glue.getScalarType('_id'),
			comment: GraphQLString,
			disabledInInterfaces: list(GraphQLID),
			enabled: GraphQLBoolean,
			languages: list(glue.getInputType(GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME)),
		},
		resolve({
			args: {
				_id,
				comment,
				disabledInInterfaces,
				enabled,
				languages,
			}
		}) {
			log.debug('_id:%s', toStr(_id));
			log.debug('comment:%s', toStr(comment));
			log.debug('disabledInInterfaces:%s', toStr(disabledInInterfaces));
			log.debug('enabled:%s', toStr(enabled));
			log.debug('languages:%s', toStr(languages));
			throw new Error('Under implementation!');
			const synonymNode = get({
				connection: connect({
					principals: [PRINCIPAL_EXPLORER_READ]
				}),
				key: _id
			});
			if (!synonymNode) {
				throw new Error(`Unable to find synonym with _id:${_id}!`);
			}
			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});

			const modifyRes = writeConnection.modify<SynonymNode>({
				key: _id,
				editor: (node) => {
					//log.debug(`node:${toStr(node)}`);
					// TODO!!!
					//log.debug(`node:${toStr(node)}`);
					return node;
				}
			});
			if (!modifyRes) {
				throw new Error(`Something went wrong when trying to modify synonym _id:${_id} from:${toStr(from)} to:${toStr(to)}!`);
			}
			//log.debug(`modifyRes:${toStr(modifyRes)}`);
			return coerceSynonymType(modifyRes);
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	});
}
