import type { RepoConnection } from '/lib/xp/node';
import type { ApiKeyNode } from '../../../types/ApiKey.d';
import type { Progress } from '../../init/Progress';


import {
	addQueryFilter,
	forceArray,
	// toStr,
} from '@enonic/js-utils';
import { NT_API_KEY } from '/lib/explorer/index';
import { setModel } from '/lib/explorer/model/setModel';
import { hasValue } from '/lib/explorer/query/hasValue';
import { getUser } from '/lib/xp/auth';


export default function model18({
	progress,
	writeConnection
}: {
	progress: Progress
	writeConnection: RepoConnection
}) {
	progress.addItems(1).setInfo('Finding all api-keys with default interface...').report().logInfo();

	const apiKeysQueryParams = {
		count: -1,
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_API_KEY])
		}),
		query: {
			boolean: {
				must: {
					term: {
						field: 'interfaces',
						value: 'default'
					}
				}
			}
		}
	};
	// log.debug('apiKeysQueryParams:%s', toStr(apiKeysQueryParams))

	const apiKeyIds = writeConnection.query(apiKeysQueryParams).hits.map(({id}) => id) as string[];
	// log.debug('apiKeyIds:%s', toStr(apiKeyIds))

	progress.addItems(apiKeyIds.length).finishItem();

	apiKeyIds.forEach((apiKeyId) => {
		progress.setInfo(`Removing default interface from api-key id:${apiKeyId}`).report().logInfo();
		writeConnection.modify<ApiKeyNode>({
			key: apiKeyId,
			editor: (apiKeyNode) => {
				const oldInterfaces = forceArray(apiKeyNode.interfaces);
				const newInterfaces = [];
				for (let i = 0; i < oldInterfaces.length; i++) {
					const interfaceName = oldInterfaces[i];
					if (interfaceName !== 'default') {
						newInterfaces.push(interfaceName);
					}
				}
				apiKeyNode.interfaces = newInterfaces;
				apiKeyNode.modifiedTime = new Date();
				apiKeyNode.modifier = getUser().key;
				return apiKeyNode;
			}
		});
		progress.finishItem();
	}); // forEach
	progress.setInfo(`Finished removing default interface from ${apiKeyIds.length} api-keys`).report().debug();
	setModel({
		connection: writeConnection,
		version: 18
	});
}
