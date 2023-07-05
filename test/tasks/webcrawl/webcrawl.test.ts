import type { UserKey } from '@enonic-types/lib-auth';
import type { Node } from '@enonic-types/lib-node';
import type { JournalNode } from '/lib/explorer/types/index.d';


import {
	// afterEach,
	// beforeEach,
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import { JavaBridge } from '@enonic/mock-xp';
import {
	APP_EXPLORER,
	COLLECTION_REPO_PREFIX,
	Folder,
	NodeType,
	Path,
	Repo
} from '@enonic/explorer-utils'
import Log from '@enonic/mock-xp/dist/Log';
import mockLibGalimatias from '../../mocks/libGalimatias';
import mockLibHttpClient from '../../mocks/libHttpClient';
import mockLibXpAuth from '../../mocks/libXpAuth';
import mockLibXpContext from '../../mocks/libXpContext';
import mockLibXpCommon from '../../mocks/libXpCommon';
import mockLibXpMail from '../../mocks/libXpMail';
import mockLibXpEvent from '../../mocks/libXpEvent';
import mockLibXpNode from '../../mocks/libXpNode';
import mockLibXpRepo from '../../mocks/libXpRepo';
import mockLibXpTask from '../../mocks/libXpTask';
import mockLibXpValue from '../../mocks/libXpValue';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
// const COLLECTOR_ID = 'collectorId';
const COLLECTOR_CONFIG = {
	baseUri: "https://www.enonic.com",
	excludes: ["^/blog.*$"],
	maxPages: 100,
}
const COLLECTOR_CONFIG2 = {
	baseUri: "https://www.example.com"
}
const CONFIG_JSON = JSON.stringify(COLLECTOR_CONFIG);
const LANGUAGE = 'en';
const NAME = 'name';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// @ts-expect-error TS2339: Property 'app' does not exist on type 'typeof globalThis'.
global.app = {
	name: APP_EXPLORER,
	version: '0.0.1-SNAPSHOT'
}
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

// @ts-expect-error TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	// loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	loglevel: 'silent'
});

const javaBridge = new JavaBridge({
	app: {
		config: {},
		name: APP_EXPLORER,
		version: '0.0.1-SNAPSHOT'
	},
	log
});
javaBridge.repo.create({
	id: Repo.EXPLORER
});
javaBridge.repo.create({
	id: Repo.JOURNALS
});
const REPO_COLLECTION_TEST = `${COLLECTION_REPO_PREFIX}test_collection`;
const REPO_COLLECTION_TEST2 = `${COLLECTION_REPO_PREFIX}test_collection2`;
javaBridge.repo.create({
	id: REPO_COLLECTION_TEST
});
javaBridge.repo.create({
	id: REPO_COLLECTION_TEST2
});
//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
mockLibGalimatias();
mockLibHttpClient();
const user = {
	displayName: 'System Administrator',
	key: 'user:system:su' as UserKey,
	login: 'su',
	disabled: false,
	// email: ,
	modifiedTime: '1970-01-01T00:00:00Z',
	idProvider: 'system',
	type: 'user' as const,
}
mockLibXpAuth({
	user
});
mockLibXpCommon();
mockLibXpContext({
	context: {
		branch: 'master',
		repository: 'com.enonic.app.explorer',
		authInfo: {
			principals: [
				'role:system.admin'
			],
			user
		},
		attributes: {}
	}
});
mockLibXpEvent();
mockLibXpMail();
const {
	connect
} = mockLibXpNode({
	javaBridge
});
mockLibXpRepo({
	javaBridge
});
mockLibXpTask();
mockLibXpValue();

//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const nodeConnection = connect({
	branch: 'master',
	repoId: Repo.EXPLORER
});
nodeConnection.create({
	_name: Folder.COLLECTIONS
});
nodeConnection.create({
	_name: 'documentTypes'
});
const createdCollection = nodeConnection.create({
	_name: 'test_collection',
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	language: 'en',
	collector: {
		name: 'com.enonic.app.explorer:webcrawl',
		configJson: CONFIG_JSON,
		config: COLLECTOR_CONFIG
	}
});
const createdCollection2 = nodeConnection.create({
	_name: 'test_collection2',
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	language: 'en',
	collector: {
		name: 'com.enonic.app.explorer:webcrawl',
		configJson: JSON.stringify(COLLECTOR_CONFIG2),
		config: COLLECTOR_CONFIG2
	}
});
const createdDocumentType = nodeConnection.create({
	_name: 'webpage',
	_nodeType: 'com.enonic.app.explorer:documentType',
	_parentPath: '/documentTypes',
	addFields: false,
	managedBy: APP_EXPLORER,
	properties: [
		{
			"active": true,
			"enabled": true,
			"fulltext": false,
			"includeInAllText": false,
			"max": 1,
			"min": 0,
			"name": "html",
			"nGram": false,
			"path": false,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": false,
			"max": 0,
			"min": 0,
			"name": "links",
			"nGram": false,
			"path": false,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": true,
			"max": 1,
			"min": 0,
			"name": "text",
			"nGram": true,
			"path": false,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": true,
			"max": 1,
			"min": 0,
			"name": "title",
			"nGram": true,
			"path": false,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": false,
			"max": 1,
			"min": 1,
			"name": "url",
			"nGram": false,
			"path": false,
			"valueType": "string"
		}
	]
});


//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webcrawl', () => {
	it('creates a journal and a document', () => {
		import('../../../src/main/resources/tasks/webcrawl/webcrawl').then((moduleName) => {
			moduleName.run({
				collectionId: createdCollection._id,
				collectorId: createdDocumentType._id, // COLLECTOR_ID,
				configJson: CONFIG_JSON,
				language: LANGUAGE,
				name: NAME,
			})
			// javaBridge.repo.list().forEach((repo) => {
			// 	// log.debug('repo:%s', repo);
			// 	const { id: repoId } = repo;
			// 	log.error('repoId:%s', repoId);
			// 	const nodeConnection = connect({
			// 		branch: 'master',
			// 		repoId
			// 	});
			// 	const queryRes = nodeConnection.query({});
			// 	// log.debug('queryRes:%s', queryRes);
			// 	queryRes.hits.forEach((hit) => {
			// 		const {id} = hit;
			// 		const node = nodeConnection.get(id);
			// 		log.error('node:%s', node);
			// 	});
			// });
			const journalConnection = connect({
				branch: 'master',
				repoId: Repo.JOURNALS
			});
			const journalNode = journalConnection.get<JournalNode>('00000000-0000-4000-8000-000000000002');
			log.info('journalNode:%s', journalNode);
			expect(journalNode.errorCount).toBe(0);
			expect(journalNode.successCount).toBe(1);
			expect(journalNode.warningCount).toBe(36);
			expect(journalNode.informations.length).toBe(14);

			const collectionConnection = connect({
				branch: 'master',
				repoId: REPO_COLLECTION_TEST
			});
			const documentNode = collectionConnection.get<Node<{
				links: string[]
				title: string
				url: string
			}>>('00000000-0000-4000-8000-000000000002');
			// log.error('documentNode:%s', documentNode);
			expect(documentNode.links.length).toBe(51);
			expect(documentNode.title).toBe('Take control of your content: Composable content platform without limitations');
			expect(documentNode.url).toBe('https://www.enonic.com/');
		});
	});

	it('handles invalid html', () => {
		import('../../../src/main/resources/tasks/webcrawl/webcrawl').then((moduleName) => {
			moduleName.run({
				collectionId: createdCollection2._id,
				collectorId: createdDocumentType._id, // COLLECTOR_ID,
				configJson: JSON.stringify(COLLECTOR_CONFIG2),
				language: LANGUAGE,
				name: NAME,
			})
			// javaBridge.repo.list().forEach((repo) => {
			// 	// log.debug('repo:%s', repo);
			// 	const { id: repoId } = repo;
			// 	log.error('repoId:%s', repoId);
			// 	const nodeConnection = connect({
			// 		branch: 'master',
			// 		repoId
			// 	});
			// 	const queryRes = nodeConnection.query({});
			// 	// log.debug('queryRes:%s', queryRes);
			// 	queryRes.hits.forEach((hit) => {
			// 		const {id} = hit;
			// 		const node = nodeConnection.get(id);
			// 		log.error('node:%s', node);
			// 	});
			// });
			const journalConnection = connect({
				branch: 'master',
				repoId: Repo.JOURNALS
			});
			const journalNode = journalConnection.get<JournalNode>('00000000-0000-4000-8000-000000000004');
			// log.error('journalNode:%s', journalNode);
			expect(journalNode.errorCount).toBe(0);
			expect(journalNode.successCount).toBe(1);
			expect(journalNode.warningCount).toBe(0);

			const collectionConnection = connect({
				branch: 'master',
				repoId: REPO_COLLECTION_TEST2
			});
			const documentNode = collectionConnection.get<Node<{
				links: string[]
				text: string
				title: string
				url: string
			}>>('00000000-0000-4000-8000-000000000002');
			// log.error('documentNode:%s', documentNode);
			expect(documentNode.links).toBe(undefined);
			expect(documentNode.text).toBe('');
			expect(documentNode.title).toBe('');
			expect(documentNode.url).toBe('https://www.example.com/');
		});
	});
});
