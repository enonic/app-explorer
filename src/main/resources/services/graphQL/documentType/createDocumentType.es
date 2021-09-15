import {
	forceArray/*,
	toStr*/
} from '@enonic/js-utils';
import {
	NT_FOLDER,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';

import {
	NAME_DOCUMENT_TYPE_FOLDER,
	NT_DOCUMENT_TYPE,
	PATH_DOCUMENT_TYPE_FOLDER
} from './constants';


export function createDocumentType({
	_name,
	properties = []
}) {
	const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
	if (!writeConnection.exists(PATH_DOCUMENT_TYPE_FOLDER)) {
		writeConnection.create({
			_name: NAME_DOCUMENT_TYPE_FOLDER,
			_nodeType: NT_FOLDER
		});
	}
	const _parentPath = PATH_DOCUMENT_TYPE_FOLDER;
	const _path = `${_parentPath}/${_name}`;
	if (writeConnection.exists(_path)) {
		throw new Error(`A documentType with _name:${_name} already exists!`);
	}
	const nodeToBeCreated = {
		_name,
		_nodeType: NT_DOCUMENT_TYPE,
		_parentPath,

		// No point in forceArray, since Enonic will "destroy" on store,
		// but we're using forceArray so sort don't throw...
		properties: forceArray(properties).sort((a, b) => (a.name > b.name) ? 1 : -1)
	};
	const createdNode = writeConnection.create(nodeToBeCreated);
	return {
		_id: createdNode._id,
		_name: createdNode._name,
		_path: createdNode._path,
		properties: forceArray(createdNode.properties) // GraphQL Schema doesn't ensure array
	};
}
