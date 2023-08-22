import {
	APP_EXPLORER,
	Principal
} from '@enonic/explorer-utils';
import { create/*, ValidationError*/} from '/lib/explorer/document/create';
import { connect } from '/lib/explorer/repo/connect';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import documentNodeToBodyItem, { ResponseItem } from './documentNodeToBodyItem';
import runWithExplorerWrite from './runWithExplorerWrite';


const COLLECTOR_ID = `${APP_EXPLORER}:documentRestApi`;
const COLLECTOR_VERSION = app.version;


export default function createOne({
	boolRequireValid,
	// branchId,
	collectionId,
	collectionName,
	data,
	documentType,
	documentTypeId,
	// repoId
}: {
	boolRequireValid: boolean
	// branchId: string
	collectionId: string
	collectionName: string
	data: Record<string, unknown>
	documentType: string
	documentTypeId: string,
	// repoId: string
}): {
	body: {
		error: string
	} | ResponseItem,
	contentType: string
	status: number
} {
	return runWithExplorerWrite(() => {
		// const writeToCollectionBranchConnection = connect({
		// 	branch: branchId,
		// 	principals: [Principal.EXPLORER_WRITE], // Additional principals to execute the callback with
		// 	repoId//,
		// 	//user // Default is the default user
		// });
		const createdNode = create({
			collectionId,
			collectionName,
			collectorId: COLLECTOR_ID,
			collectorVersion: COLLECTOR_VERSION,
			data,
			documentTypeId,
			documentTypeName: documentType,
			requireValid: boolRequireValid
		});
		if(!createdNode) {
			return {
				body: {
					error: 'Something went wrong when trying to create the document!'
				},
				contentType: 'text/json;charset=utf-8',
				status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
			}
		}
		return {
			body: documentNodeToBodyItem({
				documentNode: createdNode
			}),
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.OK
		}
	}); // runWithExplorerWrite
}
