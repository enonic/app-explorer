import {toStr} from '@enonic/js-utils';
import {
	COLLECTION_REPO_PREFIX,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {multiConnect} from '/lib/explorer/repo/multiConnect';


export function connectToCollectionRepos({
	collections,
	collectionIdToDocumentTypeId,
	documentTypeIdToName,
	repoIdObj // modified inside
}) {
	//log.debug('connectToCollectionRepos collections:%s', toStr(collections));
	const multiConnectParams = {
		principals: [PRINCIPAL_EXPLORER_READ],
		sources: collections.map(({
			_id: collectionId,
			_name: collectionName
		}) => {
			const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
			repoIdObj[repoId] = {
				collectionId,
				collectionName
			};
			const documentTypeId = collectionIdToDocumentTypeId[collectionId];
			if (documentTypeId) {
				repoIdObj[repoId].documentTypeId = documentTypeId;
				const documentTypeName = documentTypeIdToName[documentTypeId];
				if (documentTypeName) {
					repoIdObj[repoId].documentTypeName = documentTypeName;
				}
			} /*else {
				log.warning(`Unable to find documentTypeId for repoId:${repoId}`);
			}*/
			return {
				repoId,
				branch: 'master', // NOTE Hardcoded
				principals: [PRINCIPAL_EXPLORER_READ]
			};
		})
	};
	//log.debug(`multiConnectParams:${toStr(multiConnectParams)}`);
	//log.debug(`repoIdObj:${toStr({repoIdObj})}`);

	return multiConnect(multiConnectParams);
}
