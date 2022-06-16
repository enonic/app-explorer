import type {Glue} from '../../utils/Glue';

//@ts-ignore
import {GraphQLString} from '/lib/graphql';
import {
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS,
	GQL_INPUT_TYPE_HIGHLIGHT_PROPERTY
} from './constants';


export function addInputTypeHighlightProperty({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_HIGHLIGHT_PROPERTY,
		fields: {
			fieldPath: { type: GraphQLString },
			...glue.getInputFields(GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS)
		}
	});
}
