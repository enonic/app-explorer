import type {
	User,
	getUser,
	hasRole
} from '@enonic-types/lib-auth';
import type {
	get,
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
import type { DocumentNode } from '/lib/explorer/types/Document';


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
	Folder,
	NodeType,
	Path,
	Repo,
} from '@enonic/explorer-utils';

const log = Log.createLogger({
	// loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const API_KEY = 'password';
const API_KEY_HASHED = '5a42wj07pr5v1ftmiwdys7w60';
const API_KEY_NAME = 'my_api_key';
const COLLECTION_NAME = 'my_collection';
const COLLECTION_NAME2 = 'my_collection2';
const COLLECTION_REPO_ID = `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME}`;
const COLLECTION_REPO_ID2 = `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME2}`;
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
javaBridge.repo.create({
	id: COLLECTION_REPO_ID2
});


const explorerNodeConnection = javaBridge.connect({
	branch: 'master',
	repoId: Repo.EXPLORER
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
// log.debug('createdDocumentTypeNode', createdDocumentTypeNode);


explorerNodeConnection.create({
	_name: Folder.COLLECTIONS,
});
const createdCollection = explorerNodeConnection.create({
	_name: COLLECTION_NAME,
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	// documentTypeId // optional
	// collector: {}, // optional
	language: 'en',
});
const createdCollection2 = explorerNodeConnection.create({
	_name: COLLECTION_NAME2,
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	documentTypeId: createdDocumentTypeNode._id,
	// collector: {}, // optional
	// language: 'no', // optional?
});
explorerNodeConnection.create({
	_name: 'api-keys',
});
//const createdApiKeyNode =
explorerNodeConnection.create({
	_name: API_KEY_NAME,
	_nodeType: NodeType.API_KEY,
	_parentPath: Path.API_KEYS,
	collections: [COLLECTION_NAME],
	interfaces: [],
	hashed: true,
	key: API_KEY_HASHED
});


jest.mock('/lib/xp/auth', () => ({
	getUser: jest.fn<typeof getUser>().mockReturnValue(USER),
	hasRole: jest.fn<typeof hasRole>().mockReturnValue(true)
}), { virtual: true });

jest.mock('/lib/xp/common', () => ({
}), { virtual: true });

jest.mock('/lib/xp/context', () => ({
	get: jest.fn<typeof get>().mockReturnValue({
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
		describe('createOrUpdateMany', () => {
			const collectionConnection = javaBridge.connect({
				branch: 'master',
				repoId: COLLECTION_REPO_ID
			});
			const collection2Connection = javaBridge.connect({
				branch: 'master',
				repoId: COLLECTION_REPO_ID2
			});

			it('creates a single document and modifies the documentType', () => {
				import('../../../src/main/resources/webapp/documents/createOrUpdateMany').then((moduleName) => {
					const createOrUpdateManyResponse = moduleName.default({
						body: JSON.stringify({
							_documentTypeId: createdDocumentTypeNode._id,
							key: 'value'
						}),
						contentType: 'application/json',
						headers: {
							authorization: `Explorer-Api-Key ${API_KEY}`
						},
						params: {
							requireValid: 'false'
						},
						pathParams: {
							collection: COLLECTION_NAME
						}
					});
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
					// log.debug('queryRes', queryRes);
					expect(queryRes.total).toBe(1);
					let documentNode: DocumentNode;
					queryRes.hits.forEach(({id}) => {
						documentNode = collectionConnection.get(id) as unknown as DocumentNode;
						// log.debug('documentNode', documentNode);
					});
					expect(createOrUpdateManyResponse).toStrictEqual({
						body: [{
							_id: documentNode._id,
						}],
						contentType: 'text/json;charset=utf-8',
						status: 200
					});
					expect(documentNode['key']).toBe('value');
					collectionConnection.delete(documentNode._id);

					// const queryExplorerRes = explorerNodeConnection.query({});
					// // log.debug('queryExplorerRes', queryExplorerRes);
					// queryExplorerRes.hits.forEach(({id}) => {
					// 	const node = explorerNodeConnection.get(id) //as unknown as DocumentNode;
					// 	log.debug('node', node);
					// });

					const modifiedDocumentTypeNode = explorerNodeConnection.get(createdDocumentTypeNode._id);
					// log.debug('modifiedDocumentTypeNode', modifiedDocumentTypeNode);
					expect(modifiedDocumentTypeNode['properties']).toStrictEqual([{
						active: true,
						enabled: true,
						fulltext: false,
						includeInAllText: false,
						max: 0,
						min: 0,
						name: 'key',
						nGram: false,
						path: false,
						valueType: 'string'
					}]);
				});
			}); // it

			it('creates multiple documents', () => {
				import('../../../src/main/resources/webapp/documents/createOrUpdateMany').then((moduleName) => {
					const createOrUpdateManyResponse = moduleName.default({
						body: JSON.stringify([{
							_documentType: createdDocumentTypeNode._name,
							key: 'value1'
						},{
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
							collection: COLLECTION_NAME
						}
					});
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
					log.debug('queryRes', queryRes);
					expect(queryRes.total).toBe(2);
					// queryRes.hits.forEach(({id}) => {
					// 	const documentNode = collectionConnection.get(id) as unknown as DocumentNode;
					// 	log.debug('documentNode', documentNode);
					// });
					expect(createOrUpdateManyResponse).toStrictEqual({
						body: [{
							_id: queryRes.hits[0].id,
						},{
							_id: queryRes.hits[1].id,
						}],
						contentType: 'text/json;charset=utf-8',
						status: 200
					});
					expect(collectionConnection.get(queryRes.hits[0].id)['key']).toBe('value1');
					expect(collectionConnection.get(queryRes.hits[1].id)['key']).toBe('value2');

					collectionConnection.delete(queryRes.hits[0].id);
					collectionConnection.delete(queryRes.hits[1].id);
				});
			}); // it

			it('creates document using query param documentType', () => {
				import('../../../src/main/resources/webapp/documents/createOrUpdateMany').then((moduleName) => {
					const createOrUpdateManyResponse = moduleName.default({
						body: JSON.stringify({
							key: 'value'
						}),
						contentType: 'application/json',
						headers: {
							authorization: `Explorer-Api-Key ${API_KEY}`
						},
						params: {
							documentType: createdDocumentTypeNode._name,
							requireValid: 'false'
						},
						pathParams: {
							collection: COLLECTION_NAME
						}
					});
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
					// log.debug('queryRes', queryRes);
					expect(queryRes.total).toBe(1);
					// queryRes.hits.forEach(({id}) => {
					// 	const documentNode = collectionConnection.get(id) as unknown as DocumentNode;
					// 	log.debug('documentNode', documentNode);
					// });
					expect(createOrUpdateManyResponse).toStrictEqual({
						body: [{
							_id: queryRes.hits[0].id,
						}],
						contentType: 'text/json;charset=utf-8',
						status: 200
					});
					expect(collectionConnection.get(queryRes.hits[0].id)['key']).toBe('value');

					collectionConnection.delete(queryRes.hits[0].id);
				});
			}); // it

			it("does NOT create a document when it's unable to determine documentType", () => {
				import('../../../src/main/resources/webapp/documents/createOrUpdateMany').then((moduleName) => {
					const createOrUpdateManyResponse = moduleName.default({
						body: JSON.stringify({
							key: 'value'
						}),
						contentType: 'application/json',
						headers: {
							authorization: `Explorer-Api-Key ${API_KEY}`
						},
						params: {
							requireValid: 'false'
						},
						pathParams: {
							collection: COLLECTION_NAME
						}
					});
					// log.debug('createOrUpdateManyResponse', createOrUpdateManyResponse);
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
					// log.debug('queryRes', queryRes);
					expect(queryRes.total).toBe(0);
					expect(createOrUpdateManyResponse).toStrictEqual({
						body: [{
							error: 'Unknown error. The stacktrace has been logged.'
						}],
						contentType: 'text/json;charset=utf-8',
						status: 200
					});
				});
			}); // it

			it('creates a single document when documentType is only stored in the collection', () => {
				import('../../../src/main/resources/webapp/documents/createOrUpdateMany').then((moduleName) => {
					const createOrUpdateManyResponse = moduleName.default({
						body: JSON.stringify({
							_documentTypeId: createdDocumentTypeNode._id,
							key: 'value'
						}),
						contentType: 'application/json',
						headers: {
							authorization: `Explorer-Api-Key ${API_KEY}`
						},
						params: {
							requireValid: 'false'
						},
						pathParams: {
							collection: COLLECTION_NAME2
						}
					});
					const queryRes = collection2Connection.query({
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
					// log.debug('queryRes', queryRes);
					expect(queryRes.total).toBe(1);
					let documentNode: DocumentNode;
					queryRes.hits.forEach(({id}) => {
						documentNode = collection2Connection.get(id) as unknown as DocumentNode;
						// log.debug('documentNode', documentNode);
					});
					expect(createOrUpdateManyResponse).toStrictEqual({
						body: [{
							_id: documentNode._id,
						}],
						contentType: 'text/json;charset=utf-8',
						status: 200
					});
					expect(documentNode['key']).toBe('value');
					collection2Connection.delete(documentNode._id);

					// const queryExplorerRes = explorerNodeConnection.query({});
					// // log.debug('queryExplorerRes', queryExplorerRes);
					// queryExplorerRes.hits.forEach(({id}) => {
					// 	const node = explorerNodeConnection.get(id) //as unknown as DocumentNode;
					// 	log.debug('node', node);
					// });
				});
			}); // it

		}); // describe createOrUpdateMany
	});
});
