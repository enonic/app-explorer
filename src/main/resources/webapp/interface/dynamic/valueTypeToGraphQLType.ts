import {
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	//VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING
} from '@enonic/js-utils';
import {
	Date as GraphQLDate,
	DateTime as GraphQLDateTime,
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLID,
	GraphQLInt,
	Json as GraphQLJson,
	GraphQLString,
	LocalDateTime as GraphQLLocalDateTime,
	LocalTime as GraphQLLocalTime
	//@ts-ignore
} from '/lib/graphql';

import {VALUE_TYPE_JSON} from '../constants';


export function valueTypeToGraphQLType(valueType) {
	if(valueType === VALUE_TYPE_STRING) return GraphQLString; // Most values are strings
	if(valueType === VALUE_TYPE_LONG) return GraphQLInt; // Some are integers
	if(valueType === VALUE_TYPE_BOOLEAN) return GraphQLBoolean; // A few are boolean
	if(valueType === VALUE_TYPE_DOUBLE) return GraphQLFloat; // A few are floating point numbers
	if(valueType === VALUE_TYPE_INSTANT) return GraphQLDateTime;
	if(valueType === VALUE_TYPE_LOCAL_DATE) return GraphQLDate;
	if(valueType === VALUE_TYPE_LOCAL_DATE_TIME) return GraphQLLocalDateTime;
	if(valueType === VALUE_TYPE_LOCAL_TIME) return GraphQLLocalTime;
	if(valueType === VALUE_TYPE_JSON) return GraphQLJson; // Only _json thus far
	if(valueType === VALUE_TYPE_REFERENCE) return GraphQLID;
	return GraphQLString; // The rest are string
	/*if(valueType === VALUE_TYPE_GEO_POINT) return GraphQLString; // TODO https://github.com/enonic/lib-graphql/issues/95
	//if(valueType === VALUE_TYPE_ANY) return GraphQLString;
	//if(valueType === VALUE_TYPE_SET) return GraphQLString;

	// TODO Remove in lib-explorer-4.0.0/app-explorer-2.0.0 ?
	if(valueType === 'uri') return GraphQLString;
	if(valueType === 'tag') return GraphQLString;
	if(valueType === 'html') return GraphQLString;*/
}
