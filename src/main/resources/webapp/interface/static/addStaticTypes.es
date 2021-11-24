import {addStaticEnumTypes} from './addStaticEnumTypes';
import {addStaticInputFields} from './addStaticInputFields';
import {addStaticInputTypes} from './addStaticInputTypes';
import {addStaticObjectTypes} from './addStaticObjectTypes';
import {addStaticUnionTypes} from './addStaticUnionTypes';


export function addStaticTypes(glue) {
	addStaticEnumTypes(glue);
	addStaticInputFields(glue); // Must be after addStaticEnumTypes
	addStaticInputTypes(glue);
	addStaticObjectTypes(glue); // Must be before addStaticUnionTypes()
	addStaticUnionTypes(glue); // Must be after addStaticObjectTypes()
}
