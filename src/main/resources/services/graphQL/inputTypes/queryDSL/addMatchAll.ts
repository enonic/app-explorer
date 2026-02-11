import type {Glue} from '../../Glue'


import {
	GraphQLFloat
	//@ts-ignore
} from '/lib/graphql';
import { GQL_UNIQ_TYPE } from '../../constants';


export function addMatchAll({ glue }: { glue: Glue }) {
	return glue.addInputType({
		name: GQL_UNIQ_TYPE.INPUT_QUERY_DSL_EXPRESSION_MATCH_ALL,
		fields: {
			boost: { type: GraphQLFloat }
		}
	});
}
