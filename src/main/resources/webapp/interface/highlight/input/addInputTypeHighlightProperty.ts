import type {GraphQL} from '../../index.d';
import type {Glue} from '../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS,
	GQL_INPUT_TYPE_HIGHLIGHT_PROPERTY
} from './constants';


export function addInputTypeHighlightProperty({
	fieldType = GraphQLString,
	glue
} :{
	fieldType ?:GraphQL.ArgsType
	glue :Glue
}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_HIGHLIGHT_PROPERTY,
		fields: {
			field: { type: nonNull(fieldType) },
			...glue.getInputFields(GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS)
		}
	});
}
