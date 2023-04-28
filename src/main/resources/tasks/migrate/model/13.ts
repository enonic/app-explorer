import type {RepoConnection} from '@enonic-types/lib-explorer';
import type {ApiKeyNode} from '../../../types/ApiKey.d';


import {addQueryFilter} from '@enonic/js-utils';
import {NT_API_KEY} from '/lib/explorer/index';
import {setModel} from '/lib/explorer/model/setModel';
import {hasValue} from '/lib/explorer/query/hasValue';
//@ts-ignore
import {getUser} from '/lib/xp/auth';
import {Progress} from '../Progress';


type ApiKeyNodeWithType = ApiKeyNode & {
	type :string
}


export function model13({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection
}) {
	progress.addItems(1).setInfo('Finding ApiKeys...').report().logInfo();

	const apiKeysQueryParams = {
		count: -1,
		filters: addQueryFilter({
			filter: hasValue('type', [NT_API_KEY])
		}),
		query: ''
	};
	const apiKeyIds = writeConnection.query(apiKeysQueryParams).hits.map(({id}) => id) as Array<string>;
	progress.addItems(apiKeyIds.length);
	progress.finishItem();

	apiKeyIds.forEach((apiKeyId) => {
		progress.setInfo(`Making sure ApiKey has correct structure id:${apiKeyId}`).report().logInfo();
		writeConnection.modify<ApiKeyNodeWithType>({
			key: apiKeyId,
			editor: (apiKeyNode) => {
				apiKeyNode._nodeType = NT_API_KEY;
				delete apiKeyNode.type;
				apiKeyNode.createdTime = apiKeyNode._ts;
				apiKeyNode.modifiedTime = new Date();
				apiKeyNode.modifier = getUser().key;
				return apiKeyNode;
			}
		});
		progress.finishItem();
	}); // forEach
	setModel({
		connection: writeConnection,
		version: 13
	});
}
