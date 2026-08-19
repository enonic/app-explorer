import type { DocumentTypesJson } from '@enonic-types/lib-explorer';


import {fold} from '@enonic/js-utils';
import { toStr } from '@enonic/js-utils/value/toStr';
import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
import {exists as documentTypeExists} from '/lib/explorer/documentType/exists';
import { maybeUpdateManagedDocumentType } from '/lib/explorer/documentType/maybeUpdateManagedDocumentType';
import {getResource, readText} from '/lib/xp/io';


declare const Java: {
	type: <T>(s: string) => T
};

const DEBUG = false;
const TRACE = false;

const RESOURCE_KEY = Java.type<{ from: (resourcePath: string) => unknown}>('com.enonic.xp.resource.ResourceKey');


export function createFromDocumentTypesJson({
	_debug = DEBUG,
	_trace = TRACE,
	applicationKey
}: {
	_debug?: boolean;
	_trace?: boolean;
	applicationKey: string;
}) {
	const filePath = 'documentTypes.json';
	const resourcePath = `${applicationKey}:${filePath}`;

	const resource = getResource(RESOURCE_KEY.from(resourcePath));
	if (!resource.exists()) {
		return;
	}
	if (_debug) log.debug('createFromDocumentTypesJson resourcePath:%s', toStr(resourcePath));

	const resourceJson: string = readText(resource.getStream());
	if (_trace) log.debug('createFromDocumentTypesJson resourcePath:%s resourceJson:%s', toStr(resourcePath), toStr(resourceJson));

	let resourceData: DocumentTypesJson;
	try {
		resourceData = JSON.parse(resourceJson);
	} catch (e) {
		log.error(`Something went wrong while parsing resource path:${resourcePath} json:${resourceJson}!`, e);
	}
	if (_trace) log.debug('createFromDocumentTypesJson resourcePath:%s resourceData:%s', toStr(resourcePath), toStr(resourceData));

	resourceData.forEach(({
		_name,
		addFields = true, // NOTE: Only overrides undefined, not null.
		version = 0, // NOTE: Only overrides undefined, not null.
		properties = [] // NOTE: Only overrides undefined, not null.
	}) => {
		const foldedLowerCaseName = fold(_name.toLowerCase());
		if (_debug) log.debug('createFromDocumentTypesJson foldedLowerCaseName:%s', toStr(foldedLowerCaseName));
		if (!documentTypeExists({_name: foldedLowerCaseName})) {
			if (_trace) log.debug('createFromDocumentTypesJson new/create foldedLowerCaseName:%s ', toStr(foldedLowerCaseName));
			createDocumentType({
				_name: foldedLowerCaseName,
				addFields,
				version,
				managedBy: applicationKey,
				properties
			});
		} else {
			if (_debug) log.debug('createFromDocumentTypesJson old/update foldedLowerCaseName:%s ', toStr(foldedLowerCaseName));
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
