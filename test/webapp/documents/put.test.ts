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
import type { PostRequest } from '../../../src/main/resources/webapp/documents/createOrUpdateMany';
import type { PutRequest } from '../../../src/main/resources/webapp/documents/put';


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
	FieldPath,
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
	// loglevel: 'error'
	loglevel: 'silent'
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
		describe('put', () => {
			const collectionConnection = javaBridge.connect({
				branch: 'master',
				repoId: COLLECTION_REPO_ID
			});

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
				import('../../../src/main/resources/webapp/documents/put').then((moduleName) => {
					expect(moduleName.default({
						body: JSON.stringify({
							// _documentTypeId: createdDocumentTypeNode._id,
							newKey: 'value'
						}),
						pathParams: {
							collectionName: COLLECTION_NAME,
							documentId: '71cffa3d-2c3f-464a-a2b0-19bd447b4b95'
						}
					} as PutRequest)).toStrictEqual({
						body: {
							message: 'Document with id "71cffa3d-2c3f-464a-a2b0-19bd447b4b95" does not exist in collection "my_collection"!'
						},
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.NOT_FOUND
					});
				});
			}); // it

			it('returns 200 Ok and overwrites the document when found', () => {
				import('../../../src/main/resources/webapp/documents/put').then((moduleName) => {
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

					const cleanedNode = collectionConnection.get(queryRes.hits[0].id);
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

					const putResponse = moduleName.default({
						body: JSON.stringify({
							// _documentTypeId: createdDocumentTypeNode._id,
							newKey: 'value'
						}),
						pathParams: {
							collectionName: COLLECTION_NAME,
							documentId: queryRes.hits[0].id
						}
					} as PutRequest);
					cleanedNode[FieldPath.META]['modifiedTime'] = putResponse.body[FieldPath.META]['modifiedTime'];

					expect(putResponse).toStrictEqual({
						body: cleanedNode,
						contentType: 'text/json;charset=utf-8',
						status: HTTP_RESPONSE_STATUS_CODES.OK
					});
				});
			}); // it

		});
	});
});
