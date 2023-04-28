import type {
	IndexConfigTemplate,
	ParentPath,
	StopwordNode
} from '@enonic-types/lib-explorer';


import {
	NT_STOP_WORDS,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {coerseStopWordType} from '/lib/explorer/stopWords/coerseStopWordType';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_MUTATION_STOP_WORDS_CREATE_NAME,
	GQL_TYPE_STOP_WORDS_NAME
} from '../constants';


export function addStopWordsCreate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_STOP_WORDS_CREATE_NAME,
		args: {
			_name: glue.getScalarType('_name'),
			words: list(GraphQLString), // null allowed
		},
		resolve(env :{
			args :{
				_name: string
				words?: Array<string>
			}
		}) {
			const {
				args: {
					_name,
					words = []
				}
			} = env;
			const writeConnection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
			const params = {
				_indexConfig: {
					default: 'byType' as IndexConfigTemplate
				},
				_parentPath: '/stopwords' as ParentPath,
				_name,
				_nodeType: NT_STOP_WORDS,
				words
			};
			const node = create(params, {connection: writeConnection}) as unknown as StopwordNode;
			/*if (!node.words) {
				node.words = [];
			}
			if (!Array.isArray(node.words)) {
				node.words = [node.words];
			}*/
			return coerseStopWordType(node);
		},
		type: glue.getObjectType(GQL_TYPE_STOP_WORDS_NAME)
	});
}
