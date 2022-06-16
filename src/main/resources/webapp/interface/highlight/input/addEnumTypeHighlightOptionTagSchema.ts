import type {Glue} from '../../utils/Glue';


import {GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS} from './constants';


export function addEnumTypeHighlightOptionTagSchema({glue} :{glue :Glue}) {
	return glue.addEnumType({
		name: GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS,
		values: [
			'styled'  // default is undefined
		]
	});
}
