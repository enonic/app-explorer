import type {Glue} from '../Glue';


import {
	GraphQLID,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {getResource, readText} from '/lib/xp/io';
import {
	GQL_QUERY_COLLECTOR_GET_MANAGED_DOCUMENT_TYPES
} from '../constants';


const RESOURCE_KEY = Java.type<{ from :(resourcePath :string) => unknown}>('com.enonic.xp.resource.ResourceKey');
const FILE_PATH = 'documentTypes.json';


export function getManagedDocumentTypes(collectorId: string) {
	const applicationKey = collectorId.substring(0,collectorId.indexOf(':'));
	// log.info('applicationKey:%s', applicationKey);

	const resourcePath = `${applicationKey}:${FILE_PATH}`;
	const resource = getResource(RESOURCE_KEY.from(resourcePath));
	if (!resource.exists()) {
		return [];
	}

	const resourceJson = readText(resource.getStream());
	let resourceData :Array<{
			_name :string
			// addFields ?:boolean
			// properties ?:DocumentTypeFields
		}>;
	try {
		resourceData = JSON.parse(resourceJson);
	} catch (e) {
		log.error(`Something went wrong while parsing resource path:${resourcePath} json:${resourceJson}!`, e);
		return [];
	}

	return resourceData.map(({_name}) => _name);
}


export function addGetManagedDocumentTypes({
	glue
} :{
	glue: Glue
}) {
	return glue.addQuery<{
		collectorId: string
	}>({
		name: GQL_QUERY_COLLECTOR_GET_MANAGED_DOCUMENT_TYPES,
		args: {
			collectorId: nonNull(GraphQLID)
		},
		resolve(env) {
			const {
				args: {
					collectorId
				}
			} = env;
			return getManagedDocumentTypes(collectorId);
		},
		type: list(GraphQLString)
	})
}
