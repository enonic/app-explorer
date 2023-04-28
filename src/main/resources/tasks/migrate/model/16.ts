import type {
	Node,
	QueryNodeParams,
	RepoConnection
} from '/lib/xp/node';
// import type {WriteConnection} from '@enonic-types/lib-explorer';

import { NodeType } from '@enonic/explorer-utils';
import {
	sanitize,
	startsWith,
	// toStr
} from '@enonic/js-utils';
import {rename} from '/lib/explorer/collection/rename';
import {setModel} from '/lib/explorer/model/setModel';
import {Progress} from '../Progress';


export function model16({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection//WriteConnection
}) {
	progress.addItems(1).setInfo('Finding all collections...').report().logInfo();
	const queryParams :QueryNodeParams = {
		count: -1,
		query: {
			boolean: {
				must: {
					term: {
						field: '_nodeType',
						value: NodeType.COLLECTION
					}
				}
			}
		}
	}
	// log.debug('queryParams:%s', toStr(queryParams));

	const collectionIds = writeConnection.query(queryParams).hits.map(({id}) => id);
	// log.debug('collectionIds:%s', toStr(collectionIds));

	progress.addItems(collectionIds.length).finishItem();

	for (let i = 0; i < collectionIds.length; i++) {
		const collectionId = collectionIds[i];
		progress.setInfo(`Processing collection:${collectionId}...`).report().logInfo();

		const collectionNode = writeConnection.get(collectionId) as Node;
		// log.debug('collectionNode:%s', toStr(collectionNode));

		if (!collectionNode) {
			log.error('Collection with id:%s not found!', collectionId);
		} else {
			const {
				_name: collectionName
			} = collectionNode
			// log.debug('collectionName:%s', collectionName);

			const sanitizedCollectionName = sanitize(collectionName)
				// sanitize allows a string to start with a digit, the GraphQL spec doesn't
				// in addition we don't want the string to start with an underscore
				.replace(/^[0-9_]+/, '')
				// and we even only want lowercase chars
				.toLowerCase();
			// log.debug('sanitizedCollectionName:%s', sanitizedCollectionName);

			if (collectionName !== sanitizedCollectionName) {
				// log.debug('%s !== %s', collectionName, sanitizedCollectionName);
				try {
					rename({
						fromName: collectionName,
						toName: sanitizedCollectionName,
						writeConnection
					});
				} catch (e) {
					if (!startsWith(e.message, 'repo.copy: Unable to get repo with id:')) {
						throw e;
					}
				}
			}
		}

		progress.finishItem();
	} // for collectionIds

	setModel({
		connection: writeConnection,
		version: 16
	});
}
