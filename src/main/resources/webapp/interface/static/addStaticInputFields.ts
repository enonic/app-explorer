import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
	GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS,
	GQL_ENUM_HIGHLIGHT_OPTION_ORDERS,
	GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS,
	GQL_INPUT_FIELDS_HIGHLIGHT,
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES
} from '../constants';


export function addStaticInputFields(glue) {
	const staticHighlightParameterPropertiesFields = glue.addInputFields({
		_name: GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES,
		fragmenter: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS) },
		fragmentSize: { type: GraphQLInt },
		noMatchSize: { type: GraphQLInt },
		numberOfFragments: { type: GraphQLInt },
		order: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ORDERS) },
		postTag: { type: GraphQLString },
		preTag: { type: GraphQLString },
		requireFieldMatch: { type: GraphQLBoolean }
	});

	glue.addInputFields({
		_name: GQL_INPUT_FIELDS_HIGHLIGHT,
		encoder: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS) }, // Global only
		...staticHighlightParameterPropertiesFields,
		tagsSchema: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS) } // Global only
	});
}
