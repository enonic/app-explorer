import {schemaGenerator} from './schemaGenerator';


const {createEnumType} = schemaGenerator;


export const GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT = createEnumType({
	name: 'EnumTypeAggregationGeoDistanceUnit',
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


export const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER = createEnumType({
	name: 'EnumTypeHighlightOptionEncoder',
	values: [
		'default',
		'html'
	]
});


export const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER = createEnumType({
	name: 'EnumTypeHighlightOptionFragmenter',
	values: [
		'simple',
		'span' // default
	]
});


export const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER = createEnumType({
	name: 'EnumTypeHighlightOptionOrder',
	values: [
		'none',  // default
		'score'
	]
});


export const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA = createEnumType({
	name: 'EnumTypeHighlightOptionTagSchema',
	values: [
		'styled'  // default is undefined
	]
});
