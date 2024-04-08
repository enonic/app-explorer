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
import type { DocumentNode } from '@enonic-types/lib-explorer/Document.d';
import type { PostRequest } from './createOrGetOrModifyOrDeleteMany';
import type { GetManyRequest } from './getMany';


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
import mockLibXpNode from '../../../../../test/mocks/libXpNode';
import mockLibXpRepo from '../../../../../test/mocks/libXpRepo';
import {
	HTTP_RESPONSE_STATUS_CODES
} from '../constants';
// import { query } from '@enonic-types/lib-content';

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

mockLibXpNode({server});
mockLibXpRepo({server});

jest.mock('/lib/xp/value', () => ({
}), { virtual: true });


//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('documents', () => {
		describe('getMany', () => {
			const collectionConnection = server.connect({
				branchId: 'master',
				repoId: COLLECTION_REPO_ID
			});

			import('./createOrGetOrModifyOrDeleteMany').then((moduleName) => {
				moduleName.default({
					body: JSON.stringify([{
						action: 'create',
						document: {
							key: 'value1'
						}
					},{
						action: 'create',
						document: {
							key: 'value2'
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
			});

			it('returns 404 Not found when there are no documents with documentId', () => {
				import('./getMany').then((moduleName) => {
					expect(moduleName.default({
						params: {
							id: 'nonexistent_document_id'
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
						}
					} as GetManyRequest)).toStrictEqual({
						body: [{
							id: 'nonexistent_document_id',
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND,
						}],
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					}); // expect
					expect(moduleName.default({
						params: {
							id: [
								'nonexistent_document_id1',
								'nonexistent_document_id2'
							]
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
						}
					} as GetManyRequest)).toStrictEqual({
						body: [{
							id: 'nonexistent_document_id1',
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND,
						},{
							id: 'nonexistent_document_id2',
							status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND,
						}],
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					}); // expect
				});
			}); // it

			it('returns 200 Ok and the document(s) when found', () => {
				import('./getMany').then((moduleName) => {
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

					const getManyRes = moduleName.default({
						params: {
							id: [
								queryRes.hits[0].id,
								queryRes.hits[1].id,
							]
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
						}
					} as GetManyRequest);
					expect(getManyRes).toStrictEqual({
						body: queryRes.hits.map(({id}) => {
							const documentNode = collectionConnection.get(id) as unknown as DocumentNode;
							return {
								collection: documentNode['document_metadata']['collection'],
								collector: documentNode['document_metadata']['collector'],
								createdTime: documentNode['document_metadata']['createdTime'],
								document: {
									key: documentNode['key'],
								},
								documentType: documentNode['document_metadata']['documentType'],
								id,
								status: HTTP_RESPONSE_STATUS_CODES.OK,
								valid: documentNode['document_metadata']['valid'],
							};
						}),
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					});
				});
			}); // it

		});
	});
});
