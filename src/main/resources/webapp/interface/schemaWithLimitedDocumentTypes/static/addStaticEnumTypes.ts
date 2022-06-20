import {
	GQL_ENUM_AGGREGATION_GEO_DISTANCE_UNITS,
	GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
	GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS,
	GQL_ENUM_HIGHLIGHT_OPTION_ORDERS,
	GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS
} from '../constants';


export function addStaticEnumTypes(glue) {
	glue.addEnumType({
		name: GQL_ENUM_AGGREGATION_GEO_DISTANCE_UNITS,
		values: {
			'km': 'km',
			'm': 'm',
			'cm': 'cm',
			'mm': 'mm',
			'mi': 'mi',
			'yd': 'yd',
			'ft': 'ft',
			'nmi': 'nmi',
			kilometers: 'km',
			meters: 'm',
			centimeters: 'cm',
			millimeters: 'mm',
			miles: 'mi',
			yards: 'yd',
			feet: 'ft',
			nauticalmiles: 'nmi'
		}
	});

	glue.addEnumType({
		name: GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
		values: [
			'default',
			'html'
		]
	});

	glue.addEnumType({
		name: GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS,
		values: [
			'simple',
			'span' // default
		]
	});

	glue.addEnumType({
		name: GQL_ENUM_HIGHLIGHT_OPTION_ORDERS,
		values: [
			'none',  // default
			'score'
		]
	});

	glue.addEnumType({
		name: GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS,
		values: [
			'styled'  // default is undefined
		]
	});
} // generateEnumTypes
