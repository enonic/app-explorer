import type {
	User,
	getUser,
	hasRole
} from '@enonic-types/lib-auth';
import type {
	get as getContext,
	run
} from '@enonic-types/lib-context';
import type {
	listener,
	send
} from '@enonic-types/lib-event';
import type {
	RepoConnection,
	connect
} from '@enonic-types/lib-node';
import type {
	Repository,
	get as getRepo
} from '@enonic-types/lib-repo';
import type { PostRequest } from '../../../src/main/resources/webapp/documents/createOrGetOrModifyOrDeleteMany';
import type { RemoveRequest } from '../../../src/main/resources/webapp/documents/deleteMany';


import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import { JavaBridge } from '@enonic/mock-xp/src/JavaBridge';
import Log from '@enonic/mock-xp/src/Log';
import {
	COLLECTION_REPO_PREFIX,
	// FieldPath,
	Folder,
	NodeType,
	Path,
	Repo,
} from '@enonic/explorer-utils';
import {
	HTTP_RESPONSE_STATUS_CODES
} from '../../../src/main/resources/webapp/constants';
// import { query } from '@enonic-types/lib-content';


const log = Log.createLogger({
	// loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	loglevel: 'error'
	// loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const API_KEY = 'password';
const COLLECTION_NAME = 'my_collection';
const COLLECTION_REPO_ID = `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME}`;
const DOCUMENT_TYPE_NAME = 'my_document_type';
const USER = {
	type: 'user',
	key: 'user:system:john.doe',
	displayName: 'John Doe',
	modifiedTime: '',
	disabled: false,
	email: 'john.doe@example.com',
	login: 'john.doe',
	idProvider: 'system'
} as User;

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
global.Java = {
	//from: jest.fn().mockImplementation((obj: any) => obj),
	type: jest.fn().mockImplementation((path: string) => {
		if (path === 'java.util.Locale') {
			return {
				forLanguageTag: jest.fn().mockImplementation((locale: string) => locale)
			}
		} else if (path === 'java.lang.System') {
			return {
				currentTimeMillis: jest.fn().mockReturnValue(1) // Needs a truthy value :)
			};
		} else {
			throw new Error(`Unmocked Java.type path: '${path}'`);
		}
	})
}
// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = log

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
const javaBridge = new JavaBridge({
	app: {
		config: {},
		name: 'app-explorer',
		version: '2.0.0'
	},
	log
});
javaBridge.repo.create({
	id: Repo.EXPLORER
});
javaBridge.repo.create({
	id: COLLECTION_REPO_ID
});

const explorerNodeConnection = javaBridge.connect({
	branch: 'master',
	repoId: Repo.EXPLORER
});

explorerNodeConnection.create({
	_name: Folder.COLLECTIONS,
});

explorerNodeConnection.create({
	_name: Folder.DOCUMENT_TYPES
});

const createdDocumentTypeNode = explorerNodeConnection.create({
	_name: DOCUMENT_TYPE_NAME,
	_nodeType: NodeType.DOCUMENT_TYPE,
	_parentPath: Path.DOCUMENT_TYPES,
	//properties: [{}]
});


// const createdCollection =
explorerNodeConnection.create({
	_name: COLLECTION_NAME,
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	documentTypeId: createdDocumentTypeNode._id,
	// collector: {}, // optional
	// language: 'no', // optional?
});

jest.mock('/lib/xp/auth', () => ({
	getUser: jest.fn<typeof getUser>().mockReturnValue(USER),
	hasRole: jest.fn<typeof hasRole>().mockReturnValue(true)
}), { virtual: true });

jest.mock('/lib/xp/common', () => ({
}), { virtual: true });

jest.mock('/lib/xp/context', () => ({
	get: jest.fn<typeof getContext>().mockReturnValue({
		attributes: {},
		branch: 'master',
		repository: Repo.EXPLORER,
		authInfo: {
			principals: [],
			user: USER
		}
	}),
	run: jest.fn<typeof run>().mockImplementation((_context, callback) => callback())
}), { virtual: true });

jest.mock('/lib/xp/event', () => ({
	listener: jest.fn<typeof listener>().mockReturnValue(undefined),
	send: jest.fn<typeof send>().mockReturnValue(undefined)
}), { virtual: true });

jest.mock('/lib/xp/node', () => ({
	connect: jest.fn<typeof connect>((params) => javaBridge.connect(params) as unknown as RepoConnection)
}), { virtual: true });

jest.mock('/lib/xp/repo', () => ({
	get: jest.fn<typeof getRepo>((repoId) => javaBridge.repo.get(repoId) as Repository)
}), { virtual: true });

jest.mock('/lib/xp/value', () => ({
}), { virtual: true });


//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('documents', () => {
		describe('deleteMany', () => {
			const collectionConnection = javaBridge.connect({
				branch: 'master',
				repoId: COLLECTION_REPO_ID
			});

			import('../../../src/main/resources/webapp/documents/createOrGetOrModifyOrDeleteMany').then((moduleName) => {
				moduleName.default({
					body: JSON.stringify([{
						action: 'create',
						key: 'value1'
					},{
						action: 'create',
						key: 'value2'
					}]),
					contentType: 'application/json',
					headers: {
						authorization: `Explorer-Api-Key ${API_KEY}`
					},
					params: {
						documentTypeId: createdDocumentTypeNode._id,
						requireValid: 'false'
					},
					pathParams: {
						collectionName: COLLECTION_NAME
					}
				} as PostRequest);
			});

			it('returns 200 Ok when there are no documents with documentId', () => {
				// const queryRes = collectionConnection.query({
				// 	query: {
				// 		boolean: {
				// 			must: {
				// 				term: {
				// 					field: '_nodeType',
				// 					value: NodeType.DOCUMENT
				// 				}
				// 			}
				// 		}
				// 	}
				// });
				// log.debug('queryRes: %s', queryRes);
				// queryRes.hits.forEach(({id}) => {
				// 	const documentNode = collectionConnection.get(id);
				// 	log.debug('documentNode: %s', documentNode);
				// });
				import('../../../src/main/resources/webapp/documents/deleteMany').then((moduleName) => {
					expect(moduleName.default({
						params: {
							id: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95'
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
						}
					} as RemoveRequest)).toStrictEqual({
						body: [{
							action: 'delete',
							error: 'Unable to find document with id = 71cffa3d-2c3f-464a-a2b0-19bd447b4b95!',
							id: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95',
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
						}],
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					}); // expect

					expect(moduleName.default({
						params: {
							id: [
								'71cffa3d-2c3f-464a-a2b0-19bd447b4b95',
								'71cffa3d-2c3f-464a-a2b0-19bd447b4b96'
							]
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
						}
					} as RemoveRequest)).toStrictEqual({
						body: [{
							action: 'delete',
							error: 'Unable to find document with id = 71cffa3d-2c3f-464a-a2b0-19bd447b4b95!',
							id: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95',
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
						},{
							action: 'delete',
							error: 'Unable to find document with id = 71cffa3d-2c3f-464a-a2b0-19bd447b4b96!',
							id: '71cffa3d-2c3f-464a-a2b0-19bd447b4b96',
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
						}],
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					}); // expect
				});
			}); // it

			it('returns 200 Ok and overwrites the document when found', () => {
				import('../../../src/main/resources/webapp/documents/deleteMany').then((moduleName) => {
					const queryRes = collectionConnection.query({
						query: {
							boolean: {
								must: {
									term: {
										field: '_nodeType',
										value: NodeType.DOCUMENT
									}
								}
							}
						}
					});
					// log.error('queryRes: %s', queryRes);

					const documentNode1 = collectionConnection.get(queryRes.hits[0].id);
					const documentNode2 = collectionConnection.get(queryRes.hits[1].id);

					const deleteResponse = moduleName.default({
						params: {
							id: queryRes.hits.map(({id}) => id)
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
						}
					} as RemoveRequest);

					expect(deleteResponse).toStrictEqual({
						body: [{
							action: 'delete',
							collection: documentNode1['document_metadata']['collection'],
							collector: documentNode1['document_metadata']['collector'],
							createdTime: documentNode1['document_metadata']['createdTime'],
							documentType: documentNode1['document_metadata']['documentType'],
							id: queryRes.hits[0].id,
							status: HTTP_RESPONSE_STATUS_CODES.OK,
							valid: documentNode1['document_metadata']['valid']
						},{
							action: 'delete',
							collection: documentNode2['document_metadata']['collection'],
							collector: documentNode2['document_metadata']['collector'],
							createdTime: documentNode2['document_metadata']['createdTime'],
							documentType: documentNode2['document_metadata']['documentType'],
							id: queryRes.hits[1].id,
							status: HTTP_RESPONSE_STATUS_CODES.OK,
							valid: documentNode2['document_metadata']['valid']
						}],
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					});
				});
			}); // it

		});
	});
});
