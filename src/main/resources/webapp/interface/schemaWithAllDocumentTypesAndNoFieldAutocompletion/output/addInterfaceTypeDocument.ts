import type {
	Glue,
	GraphQLObjectType
} from '../../utils/Glue';


import {addOutputFieldsSearchResultHit} from './addOutputFieldsSearchResultHit';


export function addInterfaceTypeDocument({
	documentTypeObjectTypes, // Just an empty obj, populated later
	glue,
} :{
	documentTypeObjectTypes :Record<string,GraphQLObjectType>
	glue :Glue
}) {
	return glue.addInterfaceType<{
		_documentTypeName :string
	}>({
		name: 'Document',
		fields: addOutputFieldsSearchResultHit({glue}),
		typeResolver({_documentTypeName}) {
			log.debug('_documentTypeName', _documentTypeName);
			return documentTypeObjectTypes[_documentTypeName]; // eslint-disable-line no-underscore-dangle
		}
	});
}
