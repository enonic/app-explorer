/*import {
	//addQueryFilter,
	//forceArray,
	toStr
} from '@enonic/js-utils';*/
import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT//,
	//PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {USER as EXPLORER_APP_USER} from '/lib/explorer/model/2/users/explorer';
import {connect} from '/lib/explorer/repo/connect';
import {maybeCreate as maybeCreateRepoAndBranch} from '/lib/explorer/repo/maybeCreate';
import {runAsSu} from '/lib/explorer/runAsSu';
import {javaLocaleToSupportedLanguage} from '/lib/explorer/stemming/javaLocaleToSupportedLanguage';
import {run as runInContext} from '/lib/xp/context';
import {
	getUser
} from '/lib/xp/auth';
import {Progress} from '../init/Progress';


import {applyTypes} from './applyTypes';
import {updateIndexConfig} from './updateIndexConfig';


export function run({
	boolRequireValid = false,
	collectionJson,
	schemaJson
}) {
	const progress = new Progress({
		info: {
			errors: [],
			message: 'Reindex task started'
		},
		total: 0
	}).report().logInfo();
	const infoObj = progress.getInfo();

	const collection = JSON.parse(collectionJson);
	//log.info(`collection:${toStr(collection)}`);

	const {
		//_id: collectionId,
		_name: collectionName,
		language = ''
	} = collection;
	//log.info(`collectionName:${toStr(collectionName)}`);

	const schema = JSON.parse(schemaJson);
	//log.info(`schema:${toStr(schema)}`);
	/*const {
		properties
	} = schema;*/
	//log.info(`properties:${toStr(properties)}`);

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	const branchId = 'master';
	runAsSu(() => maybeCreateRepoAndBranch({
		branchId,
		repoId
	}));

	let user = getUser();
	if (!user) {
		// CreateNode tries to set owner, and fails when no user
		user = {
			displayName: EXPLORER_APP_USER.displayName,
			disabled: false,
			idProvider: EXPLORER_APP_USER.idProvider, // 'system',
			key: `user:${EXPLORER_APP_USER.idProvider}:${EXPLORER_APP_USER.name}`, // `user:system:${USER_EXPLORER_APP_NAME}`,
			login: EXPLORER_APP_USER.name, //USER_EXPLORER_APP_NAME,
			type: 'user'
		};
	}
	//log.info(`user:${toStr(user)}`);

	return runInContext({
		//principals: [PRINCIPAL_EXPLORER_WRITE], // This allows any user to write
		user
	}, () => {
		const writeToCollectionBranchConnection = connect({
			branch: branchId,
			//principals: [PRINCIPAL_EXPLORER_WRITE], // Additional principals to execute the callback with
			repoId//,
			//user // Default is the default user
		});
		const documentsRes = writeToCollectionBranchConnection.query({
			count: -1,
			filters: {
				boolean: {
					must: [{
						hasValue: {
							field: '_nodeType',
							values: [NT_DOCUMENT]
						}
					}]
				}
			}
		});
		//log.info(`documentsRes:${toStr(documentsRes)}`);
		if (!documentsRes.total) {
			return;
		}
		const stemmingLanguage = language ? javaLocaleToSupportedLanguage(language) : '';
		progress.addItems(documentsRes.total);
		documentsRes.hits.forEach(({id: documentId}) => {
			infoObj.message = `Reindexing document with id:${documentId}`;
			progress.setInfo(infoObj).report().logInfo();
			// Go async with executeFunction? No we don't want to allow multiple simultanous reindexes of the same collection.
			const documentNode = writeToCollectionBranchConnection.get(documentId);
			//log.info(`documentNode:${toStr(documentNode)}`);

			if (!documentNode.document_metadata) {
				documentNode.document_metadata = {};
			}

			documentNode.document_metadata.language = language; // Can be anything
			documentNode._indexConfig = updateIndexConfig({
				_indexConfig: documentNode._indexConfig,
				path: 'document_metadata.language',
				config: {
					enabled: true, // So it can be used in filters
					decideByType: false, // Always string
					fulltext: false,
					includeInAllText: false,
					languages: [],
					ngram: false,
					path: false
				}
			}); // updateIndexConfig

			documentNode.document_metadata.stemmingLanguage = stemmingLanguage; // Can be ''
			documentNode._indexConfig = updateIndexConfig({
				_indexConfig: documentNode._indexConfig,
				path: 'document_metadata.stemmingLanguage',
				config: {
					enabled: true, // So it can be used in filters
					decideByType: false, // Always string
					fulltext: false,
					includeInAllText: false,
					languages: [],
					ngram: false,
					path: false
				}
			}); // updateIndexConfig

			try {
				const documentNodeWithTypes	= applyTypes({
					boolRequireValid,
					documentNode,
					languages: language ? [stemmingLanguage] : [],
					schema
				});
				//log.info(`documentNodeWithTypes:${toStr(documentNodeWithTypes)}`);

				// TODO diff enonify before modify

				//const updatedDocumentNode =
				writeToCollectionBranchConnection.modify({
					key: documentId,
					editor: () => documentNodeWithTypes
				});
				//log.info(`updatedDocumentNode:${toStr(updatedDocumentNode)}`);
			} catch (e) {
				const errorMessage = `documentId${documentId} message:${e.message}`;
				infoObj.errors.push(errorMessage);
				log.error(errorMessage, e);
			}
			progress.finishItem();
		});
		infoObj.message = 'Reindexing complete';
		progress.setInfo(infoObj).report().logInfo();
	}); // runInContext
} // function run
