import type {
	DocumentNode,
	MetaData
} from '@enonic-types/lib-explorer/Document.d';


import {
	COLLECTION_REPO_PREFIX,
	NodeType
} from '@enonic/explorer-utils';
/*import {
	//addQueryFilter,
	//forceArray,
	toStr
} from '@enonic/js-utils';*/
import {
	FIELD_DOCUMENT_METADATA_LANGUAGE_INDEX_CONFIG,
	FIELD_DOCUMENT_METADATA_STEMMING_LANGUAGE_INDEX_CONFIG,
} from '/lib/explorer/model/2/constants';
import {USER as EXPLORER_APP_USER} from '/lib/explorer/model/2/users/explorer';
import {connect} from '/lib/explorer/repo/connect';
import {maybeCreate as maybeCreateRepoAndBranch} from '/lib/explorer/repo/maybeCreate';
import {runAsSu} from '/lib/explorer/runAsSu';
import {javaLocaleToSupportedLanguage} from '/lib/explorer/stemming/javaLocaleToSupportedLanguage';
//@ts-ignore
import {run as runInContext} from '/lib/xp/context';
import {
	getUser
	//@ts-ignore
} from '/lib/xp/auth';
import {Progress} from '../init/Progress';


import {applyTypes} from './applyTypes';
import {updateIndexConfig} from './updateIndexConfig';


export function run({
	boolRequireValid = false,
	collectionJson,
	documentTypeJson
}) {
	const collection = JSON.parse(collectionJson) as {
		_id :string
		_name :string
		language ?:string
	};
	//log.info(`collection:${toStr(collection)}`);

	const {
		_id: collectionId,
		_name: collectionName,
		language: collectionLanguage = ''
	} = collection;
	//log.info(`collectionName:${toStr(collectionName)}`);

	const progress = new Progress<{
		collectionId :string
		errors :Array<string>
		message :string
	}>({
		info: {
			collectionId,
			errors: [],
			message: 'Reindex task started'
		},
		total: 0
	}).report().logInfo();
	const infoObj = progress.getInfo();

	// TODO check whether collection is already being reindexed
	// perhaps just end
	// perhaps sleep -> resume
	// perhaps schedule?
	// What about race conditions, which documentType should be applied?

	const documentType = JSON.parse(documentTypeJson);
	//log.info(`documentType:${toStr(documentType)}`);
	/*const {
		properties
	} = documentType;*/
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
							values: [NodeType.DOCUMENT]
						}
					}]
				}
			},
			query: ''
		});
		//log.info(`documentsRes:${toStr(documentsRes)}`);
		if (!documentsRes.total) {
			return;
		}

		const localeToStemmingCache = {};
		if (collectionLanguage) {
			localeToStemmingCache[collectionLanguage] = javaLocaleToSupportedLanguage(collectionLanguage);
		}

		progress.addItems(documentsRes.total);
		documentsRes.hits.forEach(({id: documentId}) => {
			infoObj.message = `Reindexing document with id:${documentId}`;
			progress.setInfo(infoObj).report().logInfo();
			// Go async with executeFunction? No we don't want to allow multiple simultanous reindexes of the same collection.
			const documentNode = writeToCollectionBranchConnection.get<DocumentNode>(documentId);
			//log.info(`documentNode:${toStr(documentNode)}`);

			if (!documentNode.document_metadata) {
				documentNode.document_metadata = {} as MetaData;
			}

			if (documentNode.document_metadata.language || collectionLanguage) {
				if (!documentNode.document_metadata.language) {
					documentNode.document_metadata.language = collectionLanguage; // Can be anything
				}
				documentNode._indexConfig = updateIndexConfig({
					_indexConfig: documentNode._indexConfig,
					path: 'document_metadata.language',
					config: FIELD_DOCUMENT_METADATA_LANGUAGE_INDEX_CONFIG
				}); // updateIndexConfig

				const language = documentNode.document_metadata.language;
				if (!localeToStemmingCache[language]) {
					localeToStemmingCache[language] = javaLocaleToSupportedLanguage(language);
				}

				documentNode.document_metadata.stemmingLanguage = localeToStemmingCache[language]; // Can be ''
				documentNode._indexConfig = updateIndexConfig({
					_indexConfig: documentNode._indexConfig,
					path: 'document_metadata.stemmingLanguage',
					config: FIELD_DOCUMENT_METADATA_STEMMING_LANGUAGE_INDEX_CONFIG
				}); // updateIndexConfig
			} // if language is known


			try {
				const documentNodeWithTypes	= applyTypes({
					boolRequireValid,
					documentNode,
					languages: documentNode.document_metadata.stemmingLanguage ? [documentNode.document_metadata.stemmingLanguage] : [],
					documentType
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
		}); // forEach document
		infoObj.message = 'Reindexing complete';
		progress.setInfo(infoObj).report().logInfo();
	}); // runInContext
} // function run
