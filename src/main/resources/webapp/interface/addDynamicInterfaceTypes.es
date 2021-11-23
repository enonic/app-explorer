import {toStr} from '@enonic/js-utils';

import {
	//GraphQLBoolean,
	//GraphQLDouble, // There is no such type
	GraphQLFloat,
	GraphQLID,
	//GraphQLInt,
	GraphQLString,
	Json as GraphQLJson//,
	//list,
	//newSchemaGenerator,
	//nonNull,
	//reference
} from '/lib/graphql';

import {GQL_INTERFACE_TYPE_DOCUMENT} from './constants';
//import {objToGraphQL} from './objToGraphQL';


export function addDynamicInterfaceTypes({
	documentTypeObjectTypes, // Just an empty obj, populated later
	glue/*,
	nestedFieldsObj*/
}) {
	glue.addInterfaceType({
		fields: /*objToGraphQL({
			documentTypeName: GQL_INTERFACE_TYPE_DOCUMENT,
			glue,
			obj: nestedFieldsObj
		})*/{
			_collectionId: { type: GraphQLID },
			_collectionName: { type: GraphQLString },
			_documentTypeId: { type: GraphQLID },
			_documentTypeName: { type: GraphQLString },
			_json: { type: GraphQLJson },
			_repoId: { type: GraphQLID },
			_score: { type: GraphQLFloat }
		},
		name: GQL_INTERFACE_TYPE_DOCUMENT,
		typeResolver: (node) => {
			log.debug(`addInterfaceType name:${GQL_INTERFACE_TYPE_DOCUMENT} typeResolver node:${toStr(node)}`);
			const {
				//_documentTypeId
				_documentTypeName
			} = node;
			//return objectTypeInterfaceSearchHit;
			return documentTypeObjectTypes[_documentTypeName]; // eslint-disable-line no-underscore-dangle
		}
	});
}
