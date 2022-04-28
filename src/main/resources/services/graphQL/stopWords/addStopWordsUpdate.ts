import type {StopwordNode} from '/lib/explorer/types/StopWord.d';

import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {modify} from '/lib/explorer/node/modify';
import {connect} from '/lib/explorer/repo/connect';
import {coerseStopWordType} from '/lib/explorer/stopWords/coerseStopWordType';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_MUTATION_STOP_WORDS_UPDATE_NAME,
	GQL_TYPE_STOP_WORDS_NAME
} from '../constants';


export function addStopWordsUpdate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_STOP_WORDS_UPDATE_NAME,
		args: {
			_id: glue.getScalarType('_id'),
			words: list(GraphQLString), // null allowed
		},
		resolve(env :{
			args :{
				_id :string
				words? :Array<string>
			}
		}) {
			const {
				args: {
					_id,
					words = []
				}
			} = env;
			const writeConnection = connect({principals: [PRINCIPAL_EXPLORER_WRITE]});
			const params = {
				_id,
				words
			};
			const node = modify(params, {connection: writeConnection}) as unknown as StopwordNode;
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
