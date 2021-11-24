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

import {
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT
} from '../constants';
//import {objToGraphQL} from './objToGraphQL';


export function addDynamicInterfaceTypes({
	documentTypeObjectTypes, // Just an empty obj, populated later
	glue,
	interfaceSearchHitsHighlightsFields/*,
	globalFieldsObj*/
}) {
	/*const highlightFields = {};
	Object.keys(interfaceSearchHitsHighlightsFields).forEach((camelizedFieldKey) => {
		highlightFields[camelizedFieldKey] = { // eslint-disable-line no-underscore-dangle
			type: list(GraphQLString)
		};
	});*/
	glue.addInterfaceType({
		fields: /*objToGraphQL({
			documentTypeName: GQL_INTERFACE_TYPE_DOCUMENT,
			glue,
			obj: globalFieldsObj
		})*/{
			_collectionId: { type: GraphQLID },
			_collectionName: { type: GraphQLString },
			_documentTypeId: { type: GraphQLID },
			_documentTypeName: { type: GraphQLString },
			_json: { type: GraphQLJson },
			_highlight: { type: glue.addObjectType({
				name: GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT,
				fields: interfaceSearchHitsHighlightsFields // This list can't be empty when createObjectType is called?
			})},
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
