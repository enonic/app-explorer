import type {Glue} from '../../utils/Glue';


import {
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	//GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
	//GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS,
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS,
	GQL_INPUT_TYPE_HIGHLIGHT//,
	//GQL_INPUT_TYPE_HIGHLIGHT_PROPERTY
} from './constants'
import {addEnumHighlightOptionEncoders} from './addEnumHighlightOptionEncoders';
import {addEnumTypeHighlightOptionTagSchema} from './addEnumTypeHighlightOptionTagSchema';
import {addInputFieldsHighlightPropertyOptions} from './addInputFieldsHighlightPropertyOptions';
import {addInputTypeHighlightProperty} from './addInputTypeHighlightProperty';


export function addInputTypeHighlight({glue} :{glue :Glue}) {
	addInputFieldsHighlightPropertyOptions({glue}); // Initializes GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS
	return glue.addInputType({
		name: GQL_INPUT_TYPE_HIGHLIGHT,
		//description: '',
		fields: {
			encoder: { // Global only
				type: addEnumHighlightOptionEncoders({glue})
				//type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS)
			},
			//...addInputFieldsHighlightPropertyOptions({glue}),
			...glue.getInputFields(GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTY_OPTIONS),
			properties: {
				type: nonNull(list(addInputTypeHighlightProperty({glue})))
				//type: list(glue.getInputType(GQL_INPUT_TYPE_HIGHLIGHT_PROPERTY))
			},
			tagsSchema: { // Global only
				type: addEnumTypeHighlightOptionTagSchema({glue})
				//type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS)
			}
		}
	});
}
