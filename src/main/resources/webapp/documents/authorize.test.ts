import type { Request } from '@enonic-types/core';
import type {
	User,
	hasRole
} from '@enonic-types/lib-auth';
import type { get } from '@enonic-types/lib-context';


import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import {
	COLLECTION_REPO_PREFIX,
	Folder,
	NodeType,
	Path,
	Repo,
	Role
} from '@enonic/explorer-utils';
import {
	Log,
	Server,
} from '@enonic/mock-xp';
import fnv = require('fnv-plus');
import mockLibXpNode from '../../../../../test/mocks/libXpNode';
import {
	AUTH_PREFIX,
	HTTP_RESPONSE_STATUS_CODES
} from '../constants';

type MockedRequest = Request;;


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const API_KEY = 'password';
const API_KEY3 = 'password3';
const API_KEY4 = 'password4';

const API_KEY_HASHED = '5a42wj07pr5v1ftmiwdys7w60';
const API_KEY_HASHED3 = '7as3hkiwvj3lyko24pm7c1um7';
const API_KEY_HASHED4 = '7as3hkitmvcmxddfatwkyzu6m';

const API_KEY_NAME = 'my_api_key';
const API_KEY_NAME2 = 'my_api_key2';
const API_KEY_NAME3 = 'my_api_key3';
const API_KEY_NAME4 = 'my_api_key4';

const COLLECTION_NAME = 'my_collection';
const COLLECTION_REPO_ID = `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME}`;
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
// Static Mocks
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
	_name: Folder.API_KEYS
});
explorerNodeConnection.create({
	_name: API_KEY_NAME,
	_nodeType: NodeType.API_KEY,
	_parentPath: Path.API_KEYS,
	collections: undefined,
	// interfaces: [],
	hashed: true,
	key: API_KEY_HASHED
});
explorerNodeConnection.create({
	_name: API_KEY_NAME2,
	_nodeType: NodeType.API_KEY,
	_parentPath: Path.API_KEYS,
	// collections: [COLLECTION_NAME],
	// interfaces: [],
	hashed: true,
	key: API_KEY_HASHED
});
explorerNodeConnection.create({
	_name: API_KEY_NAME3,
	_nodeType: NodeType.API_KEY,
	_parentPath: Path.API_KEYS,
	// collections: undefined,
	// interfaces: [],
	hashed: true,
	key: API_KEY_HASHED3
});
explorerNodeConnection.create({
	_name: API_KEY_NAME4,
	_nodeType: NodeType.API_KEY,
	_parentPath: Path.API_KEYS,
	collections: [COLLECTION_NAME],
	// interfaces: [],
	hashed: true,
	key: API_KEY_HASHED4
});
function staticMocks() {
	jest.mock('/lib/explorer/string/hash', () => ({
		hash: jest.fn().mockImplementation((
			value: string,
			bitlength: number = 128
		) => fnv.hash(value, bitlength).str())
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
	}), { virtual: true });
	// jest.mock('/lib/xp/node', () => ({
	// 	connect: jest.fn<typeof connect>((params) => server.connect(params) as unknown as RepoConnection)
	// }), { virtual: true });
	mockLibXpNode({server});
} // staticMocks

// getUser: jest.fn<typeof getUser>().mockReturnValue({
// 	type: 'user',
// 	key: 'user:system:su',
// 	displayName: 'Super User',
// 	modifiedTime: '',
// 	disabled: false,
// 	// email: '',
// 	login: 'su',
// 	idProvider: 'system'
// }),

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('documents', () => {
		describe('authorize', () => {

			describe('logged in to Enonic', () => {
				it('authorizes system admin', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>((role) => role === Role.SYSTEM_ADMIN)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({} as Request, COLLECTION_NAME)).toStrictEqual({
							status: 200
						});
					});
					jest.resetModules();
				});

				it('authorizes explorer admin', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>((role) => role === Role.EXPLORER_ADMIN)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({} as Request, COLLECTION_NAME)).toStrictEqual({
							status: 200
						});
					});
					jest.resetModules();
				});

				it('authorizes explorer write', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>((role) => role === Role.EXPLORER_WRITE)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({} as Request, COLLECTION_NAME)).toStrictEqual({
							status: 200
						});
					});
					jest.resetModules();
				});

				it('does NOT authorize explorer read', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>((role) => role === Role.EXPLORER_READ)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({} as Request, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.UNAUTHORIZED
						});
					});
					jest.resetModules();
				});
			}); // describe logged in to Enonic

			describe('NOT logged in to Enonic', () => {

				it('returns Unauthorized when authorization header is missing', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {}
						} as Request, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.UNAUTHORIZED
						});
					});
					jest.resetModules();
				});

				it('returns Bad Request when authorization header is invalid', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: 'invalid'
							}
						} as unknown as MockedRequest, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					});
					jest.resetModules();
				});

				it('returns Bad Request when authorization header is missing API key', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: AUTH_PREFIX
							}
						} as unknown as MockedRequest, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					});
					jest.resetModules();
				});

				it('returns Forbidden when authorization header has non existant API key', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: `${AUTH_PREFIX} nonExistentApiKey`
							}
						} as unknown as MockedRequest, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.FORBIDDEN
						});
					});
					jest.resetModules();
				});

				it('returns Forbidden when the API key it not unique', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: `${AUTH_PREFIX} ${API_KEY}`
							}
						} as unknown as MockedRequest, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.FORBIDDEN
						});
					});
					jest.resetModules();
				});

				it('returns Bad Request when the API key has access to NO collections', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: `${AUTH_PREFIX} ${API_KEY3}`
							}
						} as unknown as MockedRequest, 'another_collection')).toStrictEqual({
							body: {
								error: "The API key doesn't have access to any collections!"
							},
							contentType: 'text/json;charset=utf-8',
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					});
					jest.resetModules();
				}); // it

				it('returns Bad Request when the API key has no access to the collection', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: `${AUTH_PREFIX} ${API_KEY4}`
							}
						} as unknown as MockedRequest, 'another_collection')).toStrictEqual({
							body: {
								error: "Bad Request"
							},
							contentType: 'text/json;charset=utf-8',
							status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
						});
					});
					jest.resetModules();
				}); // it

				it('returns 200 Ok when API key has access to the collection', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: `${AUTH_PREFIX} ${API_KEY4}`
							}
						} as unknown as MockedRequest, COLLECTION_NAME)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.OK
						});
					});
					jest.resetModules();
				}); // it

				it('returns 200 Ok when there is no collectionName param, aka documentation', () => {
					staticMocks();
					jest.mock('/lib/xp/auth', () => ({
						hasRole: jest.fn<typeof hasRole>().mockReturnValue(false)
					}), { virtual: true });
					import('./authorize').then((moduleName) => {
						expect(moduleName.default({
							headers: {
								authorization: `${AUTH_PREFIX} ${API_KEY4}`
							}
						} as unknown as MockedRequest, undefined)).toStrictEqual({
							status: HTTP_RESPONSE_STATUS_CODES.OK
						});
					});
					jest.resetModules();
				}); // it

			}); // describe NOT logged in to Enonic
		}); // describe authorize
	});
});
