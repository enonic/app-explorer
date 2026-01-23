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
import type { DocumentNode } from '@enonic-types/lib-explorer/Document';
import type { PostRequest } from './createOrGetOrModifyOrDeleteMany';
import type { PutRequest } from './put';


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
	FieldPath,
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
		describe('put', () => {
			const collectionConnection = server.connect({
				branchId: 'master',
				repoId: COLLECTION_REPO_ID
			});

			import('./createOrGetOrModifyOrDeleteMany').then((moduleName) => {
				const createOrUpdateManyResponse = moduleName.default({
					body: JSON.stringify({
						key: 'value'
					}),
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

			it('returns 404 Not found when there are no documents with documentId', () => {
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
				import('./put').then((moduleName) => {
					expect(moduleName.default({
						body: JSON.stringify({
							newKey: 'value'
						}),
						params: {
							documentTypeId: createdDocumentTypeNode._id,
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
							documentId: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95'
						}
					} as PutRequest)).toStrictEqual({
						body: {
							id: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95',
							error: 'Document with id "71cffa3d-2c3f-464a-a2b0-19bd447b4b95" does not exist in collection "my_collection"!'
						},
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
					});
				});
			}); // it

			it('returns 200 Ok and overwrites the document when found', () => {
				import('./put').then((moduleName) => {
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
					// log.debug('queryRes: %s', queryRes);

					const documentNode = collectionConnection.get(queryRes.hits[0].id);
					// log.error('documentNode: %s', documentNode);

					const cleanedNode = JSON.parse(JSON.stringify(documentNode)) as DocumentNode;
					delete cleanedNode['_indexConfig'];
					delete cleanedNode['_inheritsPermissions'];
					delete cleanedNode['_nodeType'];
					delete cleanedNode['_permissions'];
					delete cleanedNode['_state'];
					delete cleanedNode['_ts'];
					delete cleanedNode['_versionKey'];
					// delete cleanedNode['document_metadata']; // TODO: Should this be deleted?

					// TODO: document.update doesn't support partial: false
					// https://github.com/enonic/lib-explorer/issues/273
					// delete cleanedNode['key'];

					cleanedNode['newkey'] = 'value'; // Yes, property keys are contrained.
					// log.error('cleanedNode: %s', cleanedNode);

					const putResponse = moduleName.default({
						body: JSON.stringify({
							newKey: 'value'
						}),
						params: {
							documentTypeId: createdDocumentTypeNode._id,
							returnDocument: 'true'
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
							documentId: queryRes.hits[0].id
						}
					} as PutRequest);
					// log.error('putResponse: %s', putResponse);

					expect(putResponse).toStrictEqual({
						body: {
							collection: documentNode['document_metadata']['collection'],
								collector: documentNode['document_metadata']['collector'],
								createdTime: documentNode['document_metadata']['createdTime'],
								document: {
									key: documentNode['key'],
									newkey: 'value',
								},
								documentType: documentNode['document_metadata']['documentType'],
								id: queryRes.hits[0].id,
								modifiedTime: putResponse.body['modifiedTime'],
								valid: documentNode['document_metadata']['valid'],
						},
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					});
				});
			}); // it

		});
	});
});
