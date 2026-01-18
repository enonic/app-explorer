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
import type { PatchRequest } from './patch';


import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import {
	Log,
	Server
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
		describe('patch', () => {
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
				import('./patch').then((moduleName) => {
					const patchRes = moduleName.default({
						body: JSON.stringify({
							newKey: 'value'
						}),
						pathParams: {
							collectionName: COLLECTION_NAME,
							documentId: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95'
						}
					} as PatchRequest);
					// log.error('patchRes: %s', patchRes);
					expect(patchRes).toStrictEqual({
						body: {
							error: 'Document with id "71cffa3d-2c3f-464a-a2b0-19bd447b4b95" does not exist in collection "my_collection"!',
							id: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95'
						},
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
					});
				});
			}); // it

			it('returns 200 Ok and overwrites the document when found', () => {
				import('./patch').then((moduleName) => {
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
					cleanedNode['newkey'] = 'value'; // Yes, property keys are contrained.
					// log.error('cleanedNode: %s', cleanedNode);

					const patchResponse = moduleName.default({
						body: JSON.stringify({
							newKey: 'value'
						}),
						params: {
							returnDocument: 'true'
						},
						pathParams: {
							collectionName: COLLECTION_NAME,
							documentId: queryRes.hits[0].id
						}
					} as PatchRequest);
					// log.error('patchResponse: %s', patchResponse);

					expect(patchResponse).toStrictEqual({
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
							modifiedTime: patchResponse.body['modifiedTime'],
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
