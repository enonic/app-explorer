import type { DocumentTypesJson } from '@enonic-types/lib-explorer';


import {fold} from '@enonic/js-utils';
import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
import {exists as documentTypeExists} from '/lib/explorer/documentType/exists';
import { maybeUpdateManagedDocumentType } from '/lib/explorer/documentType/maybeUpdateManagedDocumentType';
import {getResource, readText} from '/lib/xp/io';


declare const Java: {
	type: <T>(s: string) => T
};


const RESOURCE_KEY = Java.type<{ from: (resourcePath: string) => unknown}>('com.enonic.xp.resource.ResourceKey');


export function createFromDocumentTypesJson({
	applicationKey
}: {
	applicationKey: string
}) {
	const filePath = 'documentTypes.json';
	const resourcePath = `${applicationKey}:${filePath}`;
	const resource = getResource(RESOURCE_KEY.from(resourcePath));
	if (!resource.exists()) {
		return;
	}

	const resourceJson: string = readText(resource.getStream());
	//log.debug(`resourcePath:${resourcePath} resourceJson:${resourceJson}`);

	let resourceData: DocumentTypesJson;
	try {
		resourceData = JSON.parse(resourceJson);
	} catch (e) {
		log.error(`Something went wrong while parsing resource path:${resourcePath} json:${resourceJson}!`, e);
	}
	//log.debug(`resourcePath:${resourcePath} resourceData:${toStr(resourceData)}`);

	resourceData.forEach(({
		_name,
		addFields = true, // NOTE: Only overrides undefined, not null.
		version = 0, // NOTE: Only overrides undefined, not null.
		properties = [] // NOTE: Only overrides undefined, not null.
	}) => {
		const foldedLowerCaseName = fold(_name.toLowerCase());
		if (!documentTypeExists({_name: foldedLowerCaseName})) {
			createDocumentType({
				_name: foldedLowerCaseName,
				addFields,
				version,
				managedBy: applicationKey,
				properties
			});
		} else {
			maybeUpdateManagedDocumentType({
				_name: foldedLowerCaseName,
				addFields,
				version,
				managedBy: applicationKey,
				properties
			});
		}
	});
}
