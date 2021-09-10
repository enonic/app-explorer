import {
	addQueryFilter,
	enonify,
	forceArray,
	toStr
} from '@enonic/js-utils';
//import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';
import HumanDiff from 'human-object-diff';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';

import {
	GraphQLString,
	list
} from '/lib/graphql';

import {reindexCollections} from '../collection/reindexCollections';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME
} from '../types';
import {
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
	GQL_TYPE_DOCUMENT_TYPE
} from './types';


//const Diff = require('diff');

const { diff: diffDocumentTypeProperties } = new HumanDiff({
	objectName: 'documentTypeProperties'
});


export const fieldDocumentTypeUpdate = {
	args: {
		_id: GQL_TYPE_ID,
		_name: GQL_TYPE_NAME,
		_versionKey: GraphQLString,
		properties: list(GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES)
	},
	resolve({
		args: {
			_id: documentTypeId,
			_name: newDocumentTypeName,
			_versionKey,
			properties = []
		}
	}) {
		const writeConnection = connect({ principals: [PRINCIPAL_EXPLORER_WRITE] });
		const oldNode = writeConnection.get(documentTypeId);
		if (!oldNode) {
			throw new Error(`Could not find documentType with id:${documentTypeId}!`);
		}
		log.debug(`documentTypeId:${documentTypeId} newDocumentTypeName:${newDocumentTypeName} _versionKey:${_versionKey} activeVersionKey:${oldNode._versionKey}`);
		if (_versionKey !== oldNode._versionKey) {
			const msg = `Denying update! DocumentType changed since _versionKey:${_versionKey} activeVersionKey:${oldNode._versionKey} documentTypeId:${documentTypeId}`;
			log.error(msg);
			throw new Error(msg);
		}
		const {
			_name: oldName
		} = oldNode;
		if (newDocumentTypeName !== oldName) {
			//log.debug(`Trying to move/rename _id:${_id} from oldName:${oldName} to name:${_name}...`);
			const boolMovedorRenamed = writeConnection.move({

				// Path or id of the node to be moved or renamed
				source: documentTypeId,

				// New path or name for the node. If the target ends in slash '/',
				// it specifies the parent path where to be moved.
				// Otherwise it means the new desired path or name for the node.
				target: newDocumentTypeName

			}); // NOTE: Will throw if _path already occupied :)
			if (boolMovedorRenamed) {
				log.debug(`Moved/renamed id:${documentTypeId} from oldName:${oldName} to name:${newDocumentTypeName}`);
				writeConnection.refresh();
			} else {
				throw new Error(`Something went wrong when trying to move/rename id:${documentTypeId} from oldName:${oldName} to name:${newDocumentTypeName}`);
			}
		}
		// No point in forceArray, since Enonic will "destroy" on store,
		// but we're using forceArray so sort don't throw...
		properties = forceArray(properties).sort((a, b) => (a.name > b.name) ? 1 : -1);
		log.debug(`properties:${toStr(properties)}`);

		const enonifiedProperties = enonify(properties);
		log.debug(`enonifiedProperties:${toStr(enonifiedProperties)}`);

		if (!deepEqual(oldNode.properties, enonifiedProperties)) {
			log.debug(`!deepEqual`);
			log.debug(`oldNode.properties:${toStr(oldNode.properties)}`);
			//log.debug(`Changes detected diff:${toStr(detailedDiff(oldNode.properties, enonifiedProperties))}`); // Too narrow
			//log.debug(`Changes detected diff:${toStr(Diff.diffJson(oldNode.properties, enonifiedProperties))}`); // Too noisy

			// Pretty good. (can crash on complicated data, perhaps circular structures, which we shouldn't have anyway)
			log.debug(`Changes detected diff:${toStr(diffDocumentTypeProperties(oldNode.properties, enonifiedProperties))}`);

			const updatedNode = writeConnection.modify({
				key: documentTypeId,
				editor: (documentTypeNode) => {
					documentTypeNode.properties = properties;
					return documentTypeNode;
				}
			});
			writeConnection.refresh();

			const collectionsUsingDocumentTypeQueryParams = {
				count: -1,
				filters: addQueryFilter({
					filter: hasValue('_nodeType', [NT_COLLECTION]),
					filters: addQueryFilter({
						filter: hasValue('documentTypeId', [documentTypeId])
					})
				}),
				query: ''
			};
			//log.debug(`collectionsUsingDocumentTypeQueryParams:${toStr(collectionsUsingDocumentTypeQueryParams)}`);

			const collectionIds = writeConnection.query(collectionsUsingDocumentTypeQueryParams).hits.map(({id})=>id);
			log.debug(`collectionIds:${toStr(collectionIds)}`);

			reindexCollections({collectionIds});

			return updatedNode;
		} // if documentType changed
		log.debug('No changes detected.');
		return oldNode;
	},
	type: GQL_TYPE_DOCUMENT_TYPE
}; // fieldDocumentTypeUpdate
