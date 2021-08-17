import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	//list as listTasks
	submitTask
} from '/lib/xp/task';

import {getSchema} from '../schema/getSchema';


export function reindexCollections({collectionIds}) {
	const reports = [];
	const seenSchemas = {};
	const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	forceArray(collectionIds).forEach((collectionId) => {
		const collectionNode = readConnection.get(collectionId);
		if (!collectionNode) {
			const message = `No collection with id:${collectionId}!`;
			log.error(message);
			reports.push({
				collectionId,
				message
			});
		} else {
			const {
				_name,
				schemaId
			} = collectionNode;
			if(!schemaId) {
				const message = `Collection _id:${collectionId} _name:${_name} has no schemaId!`;
				log.warning(message);
				reports.push({
					collectionId,
					collectionName: _name,
					message
				});
			} else { // has schema
				if (!seenSchemas[schemaId]) {
					seenSchemas[schemaId] = getSchema({_id:schemaId});
				}
				const schema = seenSchemas[schemaId];
				//log.info(`schema:${toStr(schema)}`);
				if (!schema) {
					const message = `Unable to get schemaId:${schemaId} for collection _id:${collectionId} _name:${_name}!`;
					log.error(message);
					reports.push({
						collectionId,
						collectionName: _name,
						message,
						schemaId
					});
				} else {
					const taskId = submitTask({
						descriptor: `reindexCollection`,
						config: {
							collectionJson: JSON.stringify(collectionNode),
							schemaJson: JSON.stringify(schema)
						}
					});
					const message = `Started reindex of collection _id:${collectionId} _name:${_name} schemaId:${schemaId}`;
					log.debug(message);
					reports.push({
						collectionId,
						collectionName: _name,
						message,
						schemaId,
						taskId
					});
				}
			} // end of else has schema
		}
	}); // collectionIds.forEach
	return reports;
}
