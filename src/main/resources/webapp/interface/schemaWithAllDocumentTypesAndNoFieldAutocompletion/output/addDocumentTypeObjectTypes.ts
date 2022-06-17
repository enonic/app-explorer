import type {
	Glue,
	GraphQLObjectType
} from '../../utils/Glue';


import {
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_REFERENCE,
	VALUE_TYPE_STRING,
	sortKeys,
	toStr
} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {queryDocumentTypes} from '/lib/explorer/documentType/queryDocumentTypes';
import {connect} from '/lib/explorer/repo/connect';
import {
	Json as GraphQLJson
	//@ts-ignore
} from '/lib/graphql';
import {VALUE_TYPE_JSON} from '../../constants';
import {documentTypeNameToGraphQLObjectTypeName} from '../../utils/documentTypeNameToGraphQLObjectTypeName';
import {mergeFields} from '../../utils/mergeFields';
import {objToGraphQL} from '../../utils/objToGraphQL';
import {addInterfaceTypeDocument} from './addInterfaceTypeDocument';


export function addDocumentTypeObjectTypes({
	camelToFieldObj, // modified
	documentTypeObjectTypes,
	glue
} : {
	camelToFieldObj :unknown // TODO
	documentTypeObjectTypes :Record<string,GraphQLObjectType>
	glue :Glue
}) {
	const documentTypes = queryDocumentTypes({
		readConnection: connect({ principals: [PRINCIPAL_EXPLORER_READ] })
	});
	const interfaces = [
		addInterfaceTypeDocument({
			documentTypeObjectTypes, // Just an empty obj, populated later
			glue,
		})
	];
	log.debug('addDocumentTypeObjectTypes interfaces:%s', toStr(interfaces));

	for (let i = 0; i < documentTypes.hits.length; i++) {
	    const {
			_name: documentTypeName,
			properties
		} = documentTypes.hits[i];
		log.debug('addDocumentTypeObjectTypes documentTypeName:%s properties', documentTypeName, toStr(properties));

		const mergedglobalFieldsObj = mergeFields({
			camelToFieldObj, // modified
			globalFieldsObj: {
				_collection: {
					_max: 1,
					_min: 1,
					_valueType: VALUE_TYPE_STRING
				},
				_createdTime: {
					_max: 1,
					_min: 1,
					_valueType: VALUE_TYPE_STRING
				},
				_documentType: {
					_max: 1,
					_min: 1,
					_valueType: VALUE_TYPE_STRING
				},
				_json: {
					_max: 1,
					_min: 1,
					_valueType: VALUE_TYPE_JSON
				},
				_modifiedTime: {
					_max: 1,
					_min: 0,
					_valueType: VALUE_TYPE_STRING
				},
				_score: {
					_max: 1,
					_min: 1,
					_valueType: VALUE_TYPE_DOUBLE
				}
			}, // just read
			properties // just read
		});

		const fields = {
			...objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedglobalFieldsObj
			}),
			_highlight: { type: GraphQLJson }
		};

		const sortedFields = sortKeys(fields);
		log.debug('addDocumentTypeObjectTypes sortedFields:%s', toStr(sortedFields));

		documentTypeObjectTypes[documentTypeName] = glue.addObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: sortedFields,
			interfaces
		});
	}
	log.debug('addDocumentTypeObjectTypes camelToFieldObj:%s', toStr(camelToFieldObj));
}
