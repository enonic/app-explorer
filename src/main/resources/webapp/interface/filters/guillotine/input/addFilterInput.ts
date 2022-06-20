import type {GraphQL} from '../../../index.d';
import type {Glue} from '../../../utils/Glue';

//@ts-ignore
import {GraphQLString} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_FILTER//,
	//GQL_INPUT_TYPE_FILTER_BOOLEAN,
	//GQL_INPUT_TYPE_FILTER_EXISTS,
	//GQL_INPUT_TYPE_FILTER_HAS_VALUE,
	//GQL_INPUT_TYPE_FILTER_IDS,
	//GQL_INPUT_TYPE_FILTER_NOT_EXISTS
} from '../constants';
import {addBooleanFilterInput} from './addBooleanFilterInput';
import {addExistsFilterInput} from './addExistsFilterInput';
import {addNotExistsFilterInput} from './addNotExistsFilterInput';
import {addHasValueFilterInput} from './addHasValueFilterInput';
import {addIdsFilterInput} from './addIdsFilterInput';


export function addFilterInput({
	fieldType = GraphQLString, // What guillotine uses
	glue
} :{
	fieldType ?:GraphQL.ArgsType
	glue :Glue
}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER,
		description: 'Filter input type',
		fields: {
			boolean: {
				type: addBooleanFilterInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_BOOLEAN)
			},
			exists: {
				type: addExistsFilterInput({fieldType, glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_EXISTS)
			},
			notExists: {
				type: addNotExistsFilterInput({fieldType, glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_NOT_EXISTS)
			},
			hasValue: {
				type: addHasValueFilterInput({fieldType, glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_HAS_VALUE)
			},
			ids: {
				type: addIdsFilterInput({fieldType, glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_IDS)
			}
		}
	});
}
