import type {Glue} from '../../utils/Glue';


import {GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS} from './constants';


export function addEnumHighlightOptionEncoders({glue} :{glue :Glue}) {
	return glue.addEnumType({
		name: GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
		values: [
			'default',
			'html'
		]
	});
}
