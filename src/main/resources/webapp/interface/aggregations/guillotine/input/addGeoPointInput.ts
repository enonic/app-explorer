import type {Glue} from '../../../utils/Glue';


//@ts-ignore
import {GraphQLString} from '/lib/graphql';
import {GQL_INPUT_TYPE_GEO_POINT} from '../constants';


export function addGeoPointInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_GEO_POINT,
		description: 'GeoPoint range input type',
		fields: {
			lat: {
				type: GraphQLString
			},
			lon: {
				type: GraphQLString
			}
		}
	});
}
