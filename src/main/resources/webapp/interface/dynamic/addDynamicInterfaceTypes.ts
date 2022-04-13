import {
	sortKeys//,
	//toStr
} from '@enonic/js-utils';

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
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT
} from '../constants';
//import {objToGraphQL} from './objToGraphQL';


export function addDynamicInterfaceTypes({
	documentTypeObjectTypes, // Just an empty obj, populated later
	glue,
	interfaceSearchHitsHighlightsFields//,
	//globalFieldsObj
}) {
	//log.debug(`addDynamicInterfaceTypes Object.keys(globalFieldsObj):${toStr(Object.keys(globalFieldsObj))}`);
	const fields = {
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
	};
	/*Object.keys(globalFieldsObj).map((k) => {
		//log.debug(`addDynamicInterfaceTypes k:${toStr(k)}`);
		fields[`${k}_as_string`] = { type: GraphQLString };
	});*/
	const sortedFields = sortKeys(fields);
	//log.debug(`addDynamicInterfaceTypes Object.keys(sortedFields):${toStr(Object.keys(sortedFields))}`);

	glue.addInterfaceType({
		fields: sortedFields,
		name: GQL_INTERFACE_TYPE_DOCUMENT,
		typeResolver: (node) => {
			//log.debug(`addInterfaceType name:${GQL_INTERFACE_TYPE_DOCUMENT} typeResolver node:${toStr(node)}`);
			const {
				//_documentTypeId
				_documentTypeName
			} = node;
			//return objectTypeInterfaceSearchHit;
			return documentTypeObjectTypes[_documentTypeName]; // eslint-disable-line no-underscore-dangle
		}
	});
}
