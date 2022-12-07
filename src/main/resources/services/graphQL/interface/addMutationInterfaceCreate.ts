import type {TermQuery} from '/lib/explorer/types/Interface.d';

//import {toStr} from '@enonic/js-utils';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {PRINCIPAL_EXPLORER_WRITE} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/interface/create';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLID,
	GraphQLString,
	list,
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
	GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME,
	GQL_MUTATION_INTERFACE_CREATE_NAME,
	GQL_TYPE_INTERFACE_NAME,
} from '../constants';


export function addMutationInterfaceCreate({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_INTERFACE_CREATE_NAME,
		args: {
			_name: glue.getScalarType('_name'),
			collectionIds: list(GraphQLID), // null allowed
			fields: list(glue.getInputType(GQL_INPUT_TYPE_INTERFACE_FIELD_NAME)), // null allowed
			//stopWordIds: list(GraphQLID), // null allowed
			stopWords: list(GraphQLString), // null allowed
			synonymIds: list(GraphQLID), // null allowed
			termQueries: list(glue.getInputType(GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME)),
		},
		resolve(env: {
			args: {
				_name: string
				collectionIds: string[]
				fields: {
					boost?: number
					name: string
				}[]
				stopWords: string[]
				synonymIds: string[]
				termQueries: TermQuery[]
			}
		}) {
			//log.debug(`env:${toStr(env)}`);
			const {
				args: {
					_name,
					collectionIds = [],
					fields = [],
					//stopWordIds = [],
					stopWords = [],
					synonymIds = [],
					termQueries = [],
				}
			} = env;
			const createdNode = create({ // Model applies forceArray and reference
				_name,
				collectionIds, // empty array allowed
				fields,
				//stopWordIds: stopWordIds.map((stopWordId) => reference(stopWordId)), // empty array allowed
				stopWords,
				synonymIds, // empty array allowed
				termQueries, // empty array allowed
			}, {
				writeConnection: connect({principals: [PRINCIPAL_EXPLORER_WRITE]})
			});
			//log.debug(`createdNode:${toStr(createdNode)}`);
			return coerseInterfaceType(createdNode);
		},
		type: glue.getObjectType(GQL_TYPE_INTERFACE_NAME)
	});
}
