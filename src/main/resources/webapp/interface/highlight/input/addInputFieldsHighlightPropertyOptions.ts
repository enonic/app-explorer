import type {Glue} from '../../utils/Glue';


import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString
	//@ts-ignore
} from '/lib/graphql';
import {
	//GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS,
	//GQL_ENUM_HIGHLIGHT_OPTION_ORDERS,
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS
} from './constants';
import {addEnumTypeHighlightOptionFragmenter} from './addEnumTypeHighlightOptionFragmenter';
import {addEnumTypeHighlightOptionOrder} from './addEnumTypeHighlightOptionOrder';


export function addInputFieldsHighlightPropertyOptions({glue} :{glue :Glue}) {
	return glue.addInputFields({
		name: GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS,
		fields: {
			fragmenter: {
				type: addEnumTypeHighlightOptionFragmenter({glue})
				//type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS)
			},
			fragmentSize: { type: GraphQLInt },
			noMatchSize: { type: GraphQLInt },
			numberOfFragments: { type: GraphQLInt },
			order: {
				type: addEnumTypeHighlightOptionOrder({glue})
				//type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ORDERS)
			},
			postTag: { type: GraphQLString },
			preTag: { type: GraphQLString },
			requireFieldMatch: { type: GraphQLBoolean }
		}
	});
}
