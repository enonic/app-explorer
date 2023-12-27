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
import type { PostRequest } from '../../../src/main/resources/webapp/documents/createOrGetOrModifyOrDeleteMany';
import type { QueryRequest } from '../../../src/main/resources/webapp/documents/query';


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
import { HTTP_RESPONSE_STATUS_CODES } from '../../../src/main/resources/webapp/constants';


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
const API_KEY_HASHED = '5a42wj07pr5v1ftmiwdys7w60';
const API_KEY_NAME = 'my_api_key';
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
		describe('query', () => {
			it('An empty query without filters returns all documents', () => {
				import('../../../src/main/resources/webapp/documents/createOrGetOrModifyOrDeleteMany').then((createOrUpdateManyModule) => {
					createOrUpdateManyModule.default({
						body: JSON.stringify([{
							action: 'create',
							document: {
								key1: 'value1'
							}
						},{
							action: 'create',
							document: {
								key2: 'value2'
							}
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
					const collectionConnection = javaBridge.connect({
						branch: 'master',
						repoId: COLLECTION_REPO_ID
					});

					const nodeQueryRes = collectionConnection.query({
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
					// log.error('nodeQueryRes', nodeQueryRes);

					import('../../../src/main/resources/webapp/documents/query').then((moduleName) => {
						const queryResponse = moduleName.default({
							// body: JSON.stringify({
							// 	count: 10,
							// 	filters: {
							// 		boolean: {}
							// 	},
							// 	query: '',
							// 	sort: 'score DESC',
							// 	start: 0
							// }),
							// params: {
							// 	returnDocument: 'true'
							// },
							pathParams: {
								collectionName: COLLECTION_NAME
							}
						} as QueryRequest);
						// log.error('queryResponse', queryResponse);

						import('../../../src/main/resources/webapp/documents/stripDocumentNode').then((stripDocumentNodeModule) => {
							expect(queryResponse).toStrictEqual({
								body: {
									count: 2,
									hits: nodeQueryRes.hits.map(({id}) => {
										const documentNode = collectionConnection.get(id) as unknown as DocumentNode;
										const stripped = stripDocumentNodeModule.default(documentNode);
										return {
											collection: documentNode['document_metadata']['collection'],
											collector: documentNode['document_metadata']['collector'],
											createdTime: documentNode['document_metadata']['createdTime'],
											// document: {
											// 	key1: documentNode['key1'],
											// 	key2: documentNode['key2'],
											// },
											documentType: documentNode['document_metadata']['documentType'],
											id,
											language: 'en',
											stemmingLanguage: 'en',
											valid: documentNode['document_metadata']['valid'],
										};
										}
									),
									total: 2
								},
								contentType: 'text/json;charset=utf-8',
								status: HTTP_RESPONSE_STATUS_CODES.OK
							});
						}); // import stripDocumentNode
					}); // import query
				}); // import createOrUpdateMany
			}); // it
		}); // describe query
	});
});
