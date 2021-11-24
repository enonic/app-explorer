import {addDynamicEnumTypes} from './addDynamicEnumTypes';
import {addDynamicInputTypes} from './addDynamicInputTypes';
//import {addDynamicInterfaceTypes} from './addDynamicInterfaceTypes';
import {addDynamicObjectTypes} from './addDynamicObjectTypes';
import {addDynamicUnionTypes} from './addDynamicUnionTypes';


export function addDynamicTypes({
	documentTypeObjectTypes,
	fieldKeysForAggregations,
	fieldKeysForFilters,
	glue,
	highlightParameterPropertiesFields,
	interfaceSearchHitsFieldsFromSchema,
	interfaceSearchHitsHighlightsFields
}) {
	addDynamicEnumTypes({
		fieldKeysForAggregations,
		fieldKeysForFilters,
		glue
	});

	addDynamicInputTypes({
		glue,
		highlightParameterPropertiesFields
	});

	// Must be after populating documentTypeObjectTypes
	// Must be before addDynamicObjectTypes
	addDynamicUnionTypes({
		documentTypeObjectTypes, // Must be populated already, since used in types inside
		glue
	});

	addDynamicObjectTypes({ // Must be after addDynamicUnionTypes
		glue,
		interfaceSearchHitsFieldsFromSchema,
		interfaceSearchHitsHighlightsFields
	});
}
