//import {toStr} from '@enonic/js-utils';
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
	/*log.debug(`connectToCollectionRepos({
		collections:%s,
		collectionIdToDocumentTypeId:%s,
		documentTypeIdToName:%s
	})`, toStr(collections), toStr(collectionIdToDocumentTypeId), toStr(documentTypeIdToName));*/
	const multiConnectParams = {
		principals: [PRINCIPAL_EXPLORER_READ],
		sources: collections.map(({
			_id: collectionId,
			_name: collectionName
		}) => {
			//log.debug('connectToCollectionRepos() collectionId:%s collectionName:%s', collectionId, collectionName);

			const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
			//log.debug('connectToCollectionRepos() repoId:%s', repoId);

			repoIdObj[repoId] = {
				collectionId,
				collectionName
			};
			const documentTypeId = collectionIdToDocumentTypeId[collectionId];
			//log.debug('connectToCollectionRepos() documentTypeId:%s', documentTypeId);

			if (documentTypeId) {
				repoIdObj[repoId].documentTypeId = documentTypeId;
				const documentTypeName = documentTypeIdToName[documentTypeId];
				//log.debug('connectToCollectionRepos() documentTypeName:%s', documentTypeName);

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
	//log.debug('connectToCollectionRepos() multiConnectParams:%s', toStr(multiConnectParams));
	//log.debug('connectToCollectionRepos() repoIdObj:%s', toStr(repoIdObj));

	return multiConnect(multiConnectParams);
}
