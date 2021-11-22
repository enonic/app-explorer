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

import {GQL_INTERFACE_DOCUMENT_NAME} from './constants';


export function addDynamicInterfaceTypes({
	documentTypeObjectTypes,
	glue
}) {
	glue.addInterfaceType({
		fields: {
			_json: { type: GraphQLJson }
		},
		name: GQL_INTERFACE_DOCUMENT_NAME,
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
