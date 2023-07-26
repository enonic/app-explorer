import { get } from '@enonic-types/lib-context';
import type { listener } from '@enonic-types/lib-event';
import type {
    RepoConnection,
    connect
} from '@enonic-types/lib-node';


import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import { JavaBridge } from '@enonic/mock-xp/src/JavaBridge';
import Log from '@enonic/mock-xp/src/Log';
import {
	Repo,
	Folder,
	Path,
	NodeType,
	COLLECTION_REPO_PREFIX
} from '@enonic/explorer-utils';

const log = Log.createLogger({
	loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	// loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const API_KEY = 'password';
const API_KEY_HASHED = '5a42wj07pr5v1ftmiwdys7w60';
const API_KEY_NAME = 'my_api_key';
const COLLECTION_NAME = 'my_collection';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// global.Java = {
// 	type: jest.fn().mockImplementation((path: string) => {
// 		if (path === 'java.util.Locale') {
// 			return {
// 				forLanguageTag: jest.fn().mockImplementation((locale: string) => locale)
// 			}
// 		} else if (path === 'java.lang.System') {
// 			return {
// 				currentTimeMillis: jest.fn().mockReturnValue(0)
// 			};
// 		} else {
// 			throw new Error(`Unmocked Java.type path: '${path}'`);
// 		}
// 	})
// }

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = log

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
const javaBridge = new JavaBridge({
	app: {
		config: {},
		name: 'app-explorer',
		version: '1.0.0'
	},
	log
});
javaBridge.repo.create({
	id: Repo.EXPLORER
});
javaBridge.repo.create({
	id: `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME}`
});

const nodeConnection = javaBridge.connect({
	branch: 'master',
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
	_name: 'api-keys',
});
//const createdApiKeyNode =
nodeConnection.create({
    _name: API_KEY_NAME,
    _nodeType: NodeType.API_KEY,
    _parentPath: Path.API_KEYS,
    collections: [COLLECTION_NAME],
    interfaces: [],
    hashed: true,
    key: API_KEY_HASHED
});

jest.mock('/lib/xp/auth', () => ({
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
			user: {
				type: 'user',
				key: 'user:system:john.doe',
				displayName: 'John Doe',
				modifiedTime: '',
				disabled: false,
				email: 'john.doe@example.com',
				login: 'john.doe',
				idProvider: 'system'
			}
		}
	}),
}), { virtual: true });

jest.mock('/lib/xp/event', () => ({
	listener: jest.fn<typeof listener>().mockReturnValue(undefined)
}), { virtual: true });

jest.mock('/lib/xp/node', () => ({
    connect: jest.fn<typeof connect>((params) => javaBridge.connect(params) as unknown as RepoConnection)
}), { virtual: true });

jest.mock('/lib/xp/repo', () => ({
}), { virtual: true });

jest.mock('/lib/xp/value', () => ({
}), { virtual: true });

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webapp', () => {
	describe('documents', () => {
		describe('createOrUpdateMany', () => {
            it('creates a single document', () => {
                import('../../../src/main/resources/webapp/documents/createOrUpdateMany').then((moduleName) => {
                    expect(moduleName.default({
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
                    })).toBe({
                        status: 200
                    });
                });
            });
        });
    });
});