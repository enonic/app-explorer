import { get } from '@enonic-types/lib-context';
import type { listener } from '@enonic-types/lib-event';
import type {
	connect,
	RepoConnection,
} from '@enonic-types/lib-node';


import { getIn } from '@enonic/js-utils';
import {
	// afterEach,
	// beforeEach,
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {
	Log,
	Server
} from '@enonic/mock-xp';
import {
	Repo,
	Folder,
	Path,
	NodeType,
	COLLECTION_REPO_PREFIX
} from '@enonic/explorer-utils';
import fnv = require('fnv-plus');


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const API_KEY = 'password';
const API_KEY_HASHED = '5a42wj07pr5v1ftmiwdys7w60';
const API_KEY_NAME = 'my_api_key';
const COLLECTION_NAME = 'my_collection';
const INTERFACE_NAME = 'my_interface';

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
const server = new Server({
	loglevel: 'silent',
}).createRepo({
	id: Repo.EXPLORER
}).createRepo({
	id: `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME}`
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
	let log: Log
}

globalThis.log = server.log;

const nodeConnection = server.connect({
	branchId: 'master',
	repoId: Repo.EXPLORER
});
nodeConnection.create({
	_name: Folder.COLLECTIONS,
});
const createdCollection = nodeConnection.create({
	_name: COLLECTION_NAME,
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	// documentTypeId // optional
	// collector: {}, // optional
	language: 'en',
});
nodeConnection.create({
	_name: Folder.INTERFACES,
});
nodeConnection.create({
	_name: INTERFACE_NAME,
	_nodeType: NodeType.INTERFACE,
	_parentPath: Path.INTERFACES,
	collectionIds: [
		createdCollection._id
	],
});
nodeConnection.create({
	_name: 'api-keys',
});

const cacheInstance = {
	get: (key: string, fn: () => unknown) => {
		log.debug('cache.get key:%s', key);
		return fn();
	},
};

jest.mock('/lib/cache', () => ({
	newCache: jest.fn().mockReturnValue(cacheInstance)
}), { virtual: true });

// jest.mock('/lib/explorer/_coupling/javaBridge', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/interface/exists', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/interface/get', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/interface/graphql/output/makeQuery', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/interface/graphql/output/querySynonymsResolver', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/interface/graphql/output/searchResolver', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/locale/getLocales', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/node/query', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/repo/connect', () => ({
// }), { virtual: true });

jest.mock('/lib/explorer/string/hash', () => ({
	hash: jest.fn().mockImplementation((
		value: string,
		bitlength: number = 128
	) => fnv.hash(value, bitlength).str())
}), { virtual: true });

// jest.mock('/lib/explorer/synonym/query', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/thesaurus/getThesaurus', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/thesaurus/query', () => ({
// }), { virtual: true });

// jest.mock('/lib/explorer/synonym/getSynonymsFromSearchString', () => ({
// }), { virtual: true });


jest.mock('/lib/graphql', () => ({
	newSchemaGenerator: jest.fn().mockReturnValue({
		createEnumType: jest.fn().mockReturnValue({}),
		createInputObjectType: jest.fn().mockReturnValue({}),
		createInterfaceType: jest.fn().mockReturnValue({}),
		createObjectType: jest.fn().mockReturnValue({}),
		createSchema: jest.fn().mockReturnValue({}),
	}),
	nonNull: jest.fn((value) => value),
	list: jest.fn((value) => value),
	reference: jest.fn((value) => value),
	execute: jest.fn().mockReturnValue(JSON.stringify({})),
}), { virtual: true });

jest.mock('/lib/graphql-connection', () => ({
}), { virtual: true });

jest.mock('/lib/guillotine/util/factory', () => ({
}), { virtual: true });

jest.mock('/lib/util', () => ({
}), { virtual: true });

jest.mock('/lib/xp/context', () => ({
	get: jest.fn<typeof get>().mockReturnValue({
		attributes: {},
		branch: 'master',
		repository: Repo.EXPLORER,
		authInfo: {
			principals: [],
			user: {
				type: 'user',
				key: 'user:system:john.doe',
				displayName: 'John Doe',
				modifiedTime: '',
				disabled: false,
				hasPassword: true,
				email: 'john.doe@example.com',
				login: 'john.doe',
				idProvider: 'system'
			}
		}
	}),
}), { virtual: true });

jest.mock('/lib/xp/event', () => ({
	// listener: jest.fn<typeof listener>().mockImplementation((_params) => undefined)
	listener: jest.fn<typeof listener>().mockReturnValue(undefined)
}), { virtual: true });

jest.mock('/lib/xp/node', () => ({
	connect: jest.fn<typeof connect>(({
		branch,
		repoId
	}) => {
		const connection = server.connect({
			branchId: branch,
			repoId
		}) as unknown as RepoConnection
		// @ts-ignore
		connection.query = jest.fn<RepoConnection['query']>(({
			count,
			filters,
			query
		}) => {
			if (
				repoId === Repo.EXPLORER
				&& branch === 'master'
				&& count === -1
				&& getIn(filters, ['boolean', 'must', 0, 'hasValue', 'field']) === 'key'
				&& getIn(filters, ['boolean', 'must', 0, 'hasValue', 'values', 0]) === API_KEY_HASHED
				&& getIn(filters, ['boolean', 'must', 1, 'hasValue', 'field']) === '_nodetype'
				&& getIn(filters, ['boolean', 'must', 1, 'hasValue', 'values', 0]) === NodeType.API_KEY
				&& query === ''
			) {
				const node = connection.get(`${Path.API_KEYS}/${API_KEY_NAME}`);
				// log.debug('nodeConnection.query node:%s', node);
				if (node) {
					return {
						aggregations: {},
						count: 1,
						hits: [{
							id: node._id,
							score: 1
						}],
						total: 1
					}
				}
			}
			// log.debug('nodeConnection.query count:%s filters:%s query:%s', count, filters, query);
			return {
				aggregations: {},
				count: 0,
				hits: [],
				total: 0
			};
		});
		return connection;
	}),
}), { virtual: true });

jest.mock('/lib/xp/repo', () => ({
}), { virtual: true });

jest.mock('/lib/xp/value', () => ({
}), { virtual: true });

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('interface', () => {
		describe('post', () => {
			// beforeEach(() => {
			// 	jest.resetModules();
			// });

			test('returns 401 Unauthorized when Authorization header missing', () => {
				import('./post').then((moduleName) => {
					expect(moduleName.post({
						headers: {
							"explorer-interface-name": INTERFACE_NAME
						},
					})).toStrictEqual({
						status: 401
					});
				});
			});

			test("returns 400 Bad Request when Authorization doesn't start with 'Explorer-Api-Key '", () => {
				import('./post').then((moduleName) => {
					expect(moduleName.post({
						headers: {
							'authorization': 'nope',
							'explorer-interface-name': INTERFACE_NAME
						},
					})).toStrictEqual({
						status: 400
					});
				});
			});''

			test("returns 400 Bad Request when ApiKey not found in Authorization header", () => {
				import('./post').then((moduleName) => {
					expect(moduleName.post({
						headers: {
							'authorization': 'Explorer-Api-Key ',
							'explorer-interface-name': INTERFACE_NAME
						},
					})).toStrictEqual({
						status: 400
					});
				});
			});

			test("returns 403 Forbidden when api-key is not found in explorer repo", () => {
				import('./post').then((moduleName) => {
					expect(moduleName.post({
						headers: {
							'authorization': `Explorer-Api-Key ${API_KEY}`,
							'explorer-interface-name': INTERFACE_NAME
						},
					}).status).toBe(403);
				});
			});

			let apiKeyNodeId: string;
			test("returns 200 Ok, even though the api-key doesn't have access to interface", () => {
				const createdApiKeyNode = nodeConnection.create({
					_name: API_KEY_NAME,
					_nodeType: NodeType.API_KEY,
					_parentPath: Path.API_KEYS,
					collections: [COLLECTION_NAME],
					interfaces: [
						// INTERFACE_NAME
					],
					hashed: true,
					key: API_KEY_HASHED
				});
				apiKeyNodeId = createdApiKeyNode._id;
				import('./post').then((moduleName) => {
					const response = moduleName.post({
						headers: {
							'authorization': `Explorer-Api-Key ${API_KEY}`,
							'explorer-interface-name': INTERFACE_NAME
						},
					});
					// log.debug('response:%s', response);
					expect(response.status).toBe(200);
				});
			});

			test("returns 200 Ok, even though the interface doesn't exist", () => {
				// const modifiedApiKeyNode =
				nodeConnection.modify({
					key: apiKeyNodeId,
					editor: (node) => {
						node['interfaces'] = ['non-existant'];
						return node;
					},
				});
				// log.debug('modifiedApiKeyNode:%s', modifiedApiKeyNode);

				import('./post').then((moduleName) => {
					const response = moduleName.post({
						headers: {
							'authorization': `Explorer-Api-Key ${API_KEY}`,
							'explorer-interface-name': 'non-existant' // Note: Seems like this is not Enonified :(
						},
					});
					// log.debug('response:%s', response);
					expect(response.status).toBe(200);
				});
			});

			test("returns 200 Ok when api-key has access to interface", () => {
				// const modifiedApiKeyNode =
				nodeConnection.modify({
					key: apiKeyNodeId,
					editor: (node) => {
						node['interfaces'] = INTERFACE_NAME;
						return node;
					},
				});
				// log.debug('modifiedApiKeyNode:%s', modifiedApiKeyNode);
				import('./post').then((moduleName) => {
					const response = moduleName.post({
						body: JSON.stringify({
							"query": "\n    query IntrospectionQuery {\n      __schema {\n        queryType { name }\n        mutationType { name }\n        subscriptionType { name }\n        types {\n          ...FullType\n        }\n        directives {\n          name\n          description\n          locations\n          args {\n            ...InputValue\n          }\n        }\n      }\n    }\n\n    fragment FullType on __Type {\n      kind\n      name\n      description\n      fields(includeDeprecated: true) {\n        name\n        description\n        args {\n          ...InputValue\n        }\n        type {\n          ...TypeRef\n        }\n        isDeprecated\n        deprecationReason\n      }\n      inputFields {\n        ...InputValue\n      }\n      interfaces {\n        ...TypeRef\n      }\n      enumValues(includeDeprecated: true) {\n        name\n        description\n        isDeprecated\n        deprecationReason\n      }\n      possibleTypes {\n        ...TypeRef\n      }\n    }\n\n    fragment InputValue on __InputValue {\n      name\n      description\n      type { ...TypeRef }\n      defaultValue\n    }\n\n    fragment TypeRef on __Type {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  "
						}),
						headers: {
							'authorization': `Explorer-Api-Key ${API_KEY}`,
							'explorer-interface-name': INTERFACE_NAME
						},
					});
					// log.debug('response:%s', response);
					expect(response.status).toBe(200);
				});
			});

			test('returns 200 Ok even though explorer-interface-name is not in the request headers', () => {
				import('./post').then((moduleName) => {
					expect(moduleName.post({
						body: JSON.stringify({
							"query": "\n    query IntrospectionQuery {\n      __schema {\n        queryType { name }\n        mutationType { name }\n        subscriptionType { name }\n        types {\n          ...FullType\n        }\n        directives {\n          name\n          description\n          locations\n          args {\n            ...InputValue\n          }\n        }\n      }\n    }\n\n    fragment FullType on __Type {\n      kind\n      name\n      description\n      fields(includeDeprecated: true) {\n        name\n        description\n        args {\n          ...InputValue\n        }\n        type {\n          ...TypeRef\n        }\n        isDeprecated\n        deprecationReason\n      }\n      inputFields {\n        ...InputValue\n      }\n      interfaces {\n        ...TypeRef\n      }\n      enumValues(includeDeprecated: true) {\n        name\n        description\n        isDeprecated\n        deprecationReason\n      }\n      possibleTypes {\n        ...TypeRef\n      }\n    }\n\n    fragment InputValue on __InputValue {\n      name\n      description\n      type { ...TypeRef }\n      defaultValue\n    }\n\n    fragment TypeRef on __Type {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  "
						}),
						headers: {
							'authorization': `Explorer-Api-Key ${API_KEY}`,
						},
					}).status).toBe(200);
				});
			});

		}); // describe post
	});
});
