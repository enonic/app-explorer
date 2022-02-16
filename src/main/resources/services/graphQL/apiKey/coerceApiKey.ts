import {forceArray} from '@enonic/js-utils';

import type {
	ApiKey,
	ApiKeyNode
} from '../../../types/ApiKey';

export function coerceApiKey({
	_id,
	_name,
	//_path, // No reason to expose
	//_nodeType, // Useless info, always the same
	collections,
	createdTime,
	creator,
	hashed,
	interfaces,
	key,
	modifiedTime,
	modifier
} :Partial<ApiKeyNode>) :ApiKey {
	return { // whitelist :)
		_id,
		_name,
		//_path, // No reason to expose
		//_nodeType, // Useless info, always the same
		collections: collections ? forceArray(collections) : [],
		createdTime,
		creator,
		hashed,
		interfaces: interfaces ? forceArray(interfaces) : [],
		key,
		modifiedTime,
		modifier
	};
}
