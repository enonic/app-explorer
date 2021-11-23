import {
	//GraphQLBoolean,
	//GraphQLDouble, // There is no such type
	//GraphQLFloat,
	//GraphQLID,
	//GraphQLInt,
	//GraphQLString,
	Json as GraphQLJson//,
	//list,
	//newSchemaGenerator,
	//nonNull,
	//reference
} from '/lib/graphql';

import {GQL_INTERFACE_TYPE_DOCUMENT} from './constants';


export function addDynamicInterfaceTypes({
	documentTypeObjectTypes, // Just an empty obj, populated later
	glue
}) {
	glue.addInterfaceType({
		fields: {
			_json: { type: GraphQLJson }
		},
		name: GQL_INTERFACE_TYPE_DOCUMENT,
		typeResolver: (node) => {
			//log.debug(`node:${toStr(node)}`);
			const {
				//_documentTypeId
				_documentTypeName
			} = node;
			//return objectTypeInterfaceSearchHit;
			return documentTypeObjectTypes[_documentTypeName]; // eslint-disable-line no-underscore-dangle
		}
	});
}
