import type {Glue} from '../../../utils/Glue';


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


export function addFilterInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER,
		description: 'Filter input type',
		fields: {
			boolean: {
				type: addBooleanFilterInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_BOOLEAN)
			},
			exists: {
				type: addExistsFilterInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_EXISTS)
			},
			notExists: {
				type: addNotExistsFilterInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_NOT_EXISTS)
			},
			hasValue: {
				type: addHasValueFilterInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_HAS_VALUE)
			},
			ids: {
				type: addIdsFilterInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_FILTER_IDS)
			}
		}
	});
}
