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
import type { DocumentNode } from '@enonic-types/lib-explorer/Document.d';
import type { PostRequest } from '../createOrGetOrModifyOrDeleteMany';
import type { QueryRequest } from '../query';


import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import {
	Log,
	Server,
} from '@enonic/mock-xp';
import {
	COLLECTION_REPO_PREFIX,
	Folder,
	NodeType,
	Path,
	Repo,
} from '@enonic/explorer-utils';
import fnv = require('fnv-plus');
import mockLibXpNode from '../../../../../../test/mocks/libXpNode';
import mockLibXpRepo from '../../../../../../test/mocks/libXpRepo';
import { HTTP_RESPONSE_STATUS_CODES } from '../../constants';



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
	hasPassword: true,
	email: 'john.doe@example.com',
	login: 'john.doe',
	idProvider: 'system'
} as User;

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
const server = new Server({
	loglevel: 'silent'
}).createRepo({
	id: Repo.EXPLORER
}).createRepo({
	id: COLLECTION_REPO_ID
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
	let log: Log
}

globalThis.log = server.log;

const explorerNodeConnection = server.connect({
	branchId: 'master',
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

jest.mock('/lib/explorer/string/hash', () => ({
	hash: jest.fn().mockImplementation((
		value: string,
		bitlength: number = 128
	) => fnv.hash(value, bitlength).str())
}), { virtual: true });

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

mockLibXpNode({server});
mockLibXpRepo({server});

jest.mock('/lib/xp/value', () => ({
}), { virtual: true });

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('documents', () => {
		describe('query', () => {
			it('filter and query works', () => {
				import('../createOrGetOrModifyOrDeleteMany').then((createOrUpdateManyModule) => {
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
					const collectionConnection = server.connect({
						branchId: 'master',
						repoId: COLLECTION_REPO_ID
					});
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
					// // log.error('queryRes: %s', queryRes);
					// queryRes.hits.forEach(({id}) => {
					// 	const documentNode = collectionConnection.get(id) as unknown as DocumentNode;
					// 	log.error('documentNode: %s', documentNode);
					// });

					const nodeQueryRes = collectionConnection.query({
						filters: {
							boolean: {
								mustNot: {
									hasValue: {
										field: 'key1',
										values: [
											'value1'
										]
									}
								}
							}
						},
						query: {
							boolean: {
								must: [{
									term: {
										field: '_nodeType',
										value: NodeType.DOCUMENT
									}
								}],
								mustNot: [{
									term: {
										field: 'key2',
										value: 'value2'
									}
								}]
							}
						}
					});
					// log.error('nodeQueryRes', nodeQueryRes); // Should be empty

					import('../query').then((queryModule) => {
						const queryResponse = queryModule.default({
							body: JSON.stringify({
							// 	count: 10,
								filters: {
									boolean: {
										mustNot: {
											hasValue: {
												field: 'key1',
												values: [
													'value1'
												]
											}
										}
									}
								},
								query: {
									boolean: {
										mustNot: {
											term: {
												field: 'key2',
												value: 'value2'
											}
										}
									}
								},
							// 	sort: 'score DESC',
							// 	start: 0
							}),
							pathParams: {
								collectionName: COLLECTION_NAME
							}
						} as QueryRequest);
						// log.debug('queryResponse', queryResponse);
						expect(queryResponse).toStrictEqual({
							body: {
								count: 0,
								hits:[],
								total: 0
							},
							contentType: 'text/json;charset=utf-8',
							status: HTTP_RESPONSE_STATUS_CODES.OK
						});
					}); // import query
				}); // import createOrUpdateMany
			}); // it
		}); // describe query
	});
});
