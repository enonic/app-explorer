import type { JournalNode } from '/lib/explorer/types/index.d';
import type { WebCrawlDocument } from './webcrawl.d';


import {
	beforeAll,
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import {
	App,
	Log,
	Server
} from '@enonic/mock-xp';
import {
	APP_EXPLORER,
	COLLECTION_REPO_PREFIX,
	Folder,
	NodeType,
	Path,
	Repo
} from '@enonic/explorer-utils';
import fnv = require('fnv-plus');
import {
	APP_NAME,
	EXPLORER_VERSION
} from '../../../../../jest.config';
import mockLibGalimatias from '../../../../../test/mocks/libGalimatias';
import mockLibHttpClient from '../../../../../test/mocks/libHttpClient';
import mockLibXpAuth from '../../../../../test/mocks/libXpAuth';
import mockLibXpContext from '../../../../../test/mocks/libXpContext';
import mockLibXpCommon from '../../../../../test/mocks/libXpCommon';
import mockLibXpMail from '../../../../../test/mocks/libXpMail';
import mockLibXpEvent from '../../../../../test/mocks/libXpEvent';
import mockLibXpIo from '../../../../../test/mocks/libXpIo';
import mockLibXpNode from '../../../../../test/mocks/libXpNode';
import mockLibXpRepo from '../../../../../test/mocks/libXpRepo';
import mockLibXpScheduler from '../../../../../test/mocks/libXpScheduler';
import mockLibXpTask from '../../../../../test/mocks/libXpTask';
import mockLibXpValue from '../../../../../test/mocks/libXpValue';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const COLLECTOR_CONFIG = {
	baseUri: "https://www.enonic.com",
	excludes: ["^/blog.*$"],
	maxPages: 100,
}
const COLLECTOR_CONFIG2 = {
	baseUri: "https://www.example.com"
}
const COLLECTOR_CONFIG3 = {
	baseUri: "https://www.features.com"
}
const CONFIG_JSON = JSON.stringify(COLLECTOR_CONFIG);
const LANGUAGE = 'en';


const REPO_COLLECTION_TEST = `${COLLECTION_REPO_PREFIX}test_collection`;
const REPO_COLLECTION_TEST2 = `${COLLECTION_REPO_PREFIX}test_collection2`;
const REPO_COLLECTION_TEST3 = `${COLLECTION_REPO_PREFIX}test_collection3`;

const server = new Server({
	loglevel: 'silent',
	// loglevel: 'error',
}).createRepo({
	id: Repo.EXPLORER
}).createRepo({
	id: Repo.JOURNALS
}).createRepo({
	id: REPO_COLLECTION_TEST
}).createRepo({
	id: REPO_COLLECTION_TEST2
}).createRepo({
	id: REPO_COLLECTION_TEST3
}).su();

const app = new App({
	config: {},
	key: APP_NAME,
	version: EXPLORER_VERSION
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
	let log: Log
}

globalThis.log = server.log;

//──────────────────────────────────────────────────────────────────────────────
// Mocks
//──────────────────────────────────────────────────────────────────────────────
jest.mock('/lib/explorer/string/hash', () => ({
	hash: jest.fn().mockImplementation((
		value: string,
		bitlength: number = 128
	) => fnv.hash(value, bitlength).str())
}), { virtual: true });

mockLibGalimatias();
mockLibHttpClient();
mockLibXpAuth({ server });
mockLibXpCommon();
mockLibXpContext({ server });
mockLibXpEvent({ server });
mockLibXpIo({ app });
mockLibXpMail({ log });
mockLibXpNode({ server });
mockLibXpRepo({ server });
mockLibXpScheduler();
mockLibXpTask();
mockLibXpValue();

//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const nodeConnection = server.connect({
	branchId: 'master',
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
const createdCollection3 = nodeConnection.create({
	_name: 'test_collection3',
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	language: 'en',
	collector: {
		name: 'com.enonic.app.explorer:webcrawl',
		configJson: JSON.stringify(COLLECTOR_CONFIG3),
		config: COLLECTOR_CONFIG3
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
			"fulltext": true,
			"includeInAllText": true,
			"max": 1,
			"min": 0,
			"name": "displayname",
			"nGram": true,
			"path": false,
			"stemmed": true,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": false,
			"max": 1,
			"min": 1,
			"name": "domain",
			"nGram": true,
			"path": false,
			"stemmed": false,
			"valueType": "string"
		},
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
			"name": "og_description",
			"nGram": true,
			"path": false,
			"stemmed": true,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": false,
			"includeInAllText": false,
			"max": 1,
			"min": 0,
			"name": "og_locale",
			"nGram": false,
			"path": false,
			"stemmed": false,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": false,
			"max": 1,
			"min": 0,
			"name": "og_site_name",
			"nGram": true,
			"path": false,
			"stemmed": false,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": false,
			"max": 1,
			"min": 0,
			"name": "og_title",
			"nGram": true,
			"path": false,
			"stemmed": true,
			"valueType": "string"
		},
		{
			"active": true,
			"enabled": true,
			"fulltext": true,
			"includeInAllText": false,
			"max": 1,
			"min": 1,
			"name": "path",
			"nGram": true,
			"path": true,
			"stemmed": false,
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

const collectionConnection = server.connect({
	branchId: 'master',
	repoId: REPO_COLLECTION_TEST
});

const collectionConnection2 = server.connect({
	branchId: 'master',
	repoId: REPO_COLLECTION_TEST2
});

const collectionConnection3 = server.connect({
	branchId: 'master',
	repoId: REPO_COLLECTION_TEST3
});

const journalConnection = server.connect({
	branchId: 'master',
	repoId: Repo.JOURNALS
});


//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('webcrawl', () => {
	beforeAll((done) => {
		// console.log('1 - beforeAll')
		collectionConnection.create({
			_nodeType: 'com.enonic.app.explorer:document',
			// This urls needs to be linked to from one of the crawled pages
			url: 'https://www.enonic.com/blog/top-10-ai-tools-for-content-editors'
		});
		import('./webcrawl').then((moduleName) => {
			moduleName.run({
				collectionId: createdCollection._id,
				collectorId: createdDocumentType._id, // COLLECTOR_ID,
				configJson: CONFIG_JSON,
				language: LANGUAGE,
			});
			moduleName.run({
				collectionId: createdCollection2._id,
				collectorId: createdDocumentType._id, // COLLECTOR_ID,
				configJson: JSON.stringify(COLLECTOR_CONFIG2),
				language: LANGUAGE,
			});
			moduleName.run({
				collectionId: createdCollection3._id,
				collectorId: createdDocumentType._id, // COLLECTOR_ID,
				configJson: JSON.stringify(COLLECTOR_CONFIG3),
				language: LANGUAGE,
			}); // run
			// console.log('1 - beforeAll - done')
			done();
		});
	});

	describe('collection enonic', () => {
		it('deletes old documents, even though they match exclude pattern', () => {
			const queryRes = collectionConnection.query({
				query: {
					boolean: {
						must: {
							term: {
								field: 'url',
								value: 'https://www.enonic.com/blog/top-10-ai-tools-for-content-editors'
							}
						}
					}
				}
			});
			// log.error('queryRes:%s', queryRes);
			expect(queryRes.hits.length).toBe(0);
			// queryRes.hits.forEach((hit) => {
			// 	const {id} = hit;
			// 	const node = collectionConnection.get(id);
			// 	const {
			// 		_path,
			// 		_nodeType
			// 	} = node;
			// 	if (_nodeType === 'com.enonic.app.explorer:document') {
			// 		log.error('node:%s', {...node,
			// 			_indexConfig: undefined,
			// 			links: undefined,
			// 			text: undefined,
			// 		});
			// 	} else {
			// 		log.error('node:%s', {
			// 			_path,
			// 			_nodeType
			// 		});
			// 	}
			// });
		});

		it('creates a journal and a document', () => {
			// server.listRepos().forEach((repo) => {
			// 	// log.debug('repo:%s', repo);
			// 	const { id: repoId } = repo;
				// const repoId = Repo.JOURNALS;
				// const repoId = REPO_COLLECTION_TEST;
				// log.error('repoId:%s', repoId);
				// const nodeConnection = server.connect({
				// 	branchId: 'master',
				// 	repoId
				// });
				// const queryRes = nodeConnection.query({});
				// // log.debug('queryRes:%s', queryRes);
				// queryRes.hits.forEach((hit) => {
				// 	const {id} = hit;
				// 	const node = nodeConnection.get(id);
				// 	log.error('node:%s', node);
				// });
			// });

			const journalNode = journalConnection.get/*<JournalNode>*/('00000000-0000-4000-8000-000000000002') as JournalNode;
			// log.error('journalNode:%s', journalNode);
			expect(journalNode.errorCount).toBe(0);

			expect(journalNode.successCount).toBe(3);
			expect(journalNode.successes).toEqual([{
				message: 'https://www.enonic.com'
			},{
				message: 'https://www.enonic.com/resources/case-studies/nav-headless-next-js'
			},{
				message: 'url:https://www.enonic.com/blog/top-10-ai-tools-for-content-editors deleted'
			}]);

			expect(journalNode.warningCount).toBe(38);

			expect(journalNode.informations.length).toBe(8);
			expect(journalNode.informations).toEqual([{
				message: '/platform/overview Not indexable in robots.txt'
			},{
				message: '/company/about Not allowed in robots.txt'
			},{
				message: '/company/timeline Not allowed in robots.txt'
			},{
				message: '/company/careers Not allowed in robots.txt'
			},{
				message: '/company/our-services Not allowed in robots.txt'
			},{
				message: '/company/partner-list Not allowed in robots.txt'
			},{
				message: '/company/contact-us Not allowed in robots.txt'
			},{
				message: '/company Not allowed in robots.txt'
			}]);

			// const queryRes = collectionConnection.query({
			// 	count: -1,
			// 	query: ''
			// });
			// log.error('queryRes:%s', queryRes);

			const documentNode = collectionConnection.get('00000000-0000-4000-8000-000000000005') as unknown as WebCrawlDocument;
			// log.error('documentNode:%s', documentNode);
			expect(documentNode.links.length).toBe(48);
			expect(documentNode.title).toBe('Take control of your content: Composable content platform without limitations');
			expect(documentNode.url).toBe('https://www.enonic.com');
		}); // it
	}); // describe collection

	describe('collection example', () => {
		it('handles invalid html', () => {
			// server.listRepos().forEach((repo) => {
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
			const journalNode = journalConnection.get/*<JournalNode>*/('00000000-0000-4000-8000-000000000004') as JournalNode;
			// log.error('journalNode:%s', journalNode);
			expect(journalNode.errorCount).toBe(0);
			expect(journalNode.successCount).toBe(1);
			expect(journalNode.warningCount).toBe(0);

			// const queryRes = collectionConnection2.query({
			// 	count: -1,
			// 	query: ''
			// });
			// log.error('queryRes:%s', queryRes);

			const documentNode = collectionConnection2.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			// log.error('documentNode:%s', documentNode);
			expect(documentNode.links).toBe(undefined);
			expect(documentNode.text).toBe('');
			expect(documentNode.title).toBe('');
			expect(documentNode.url).toBe('https://www.example.com');
		}); // it
	}); // describe collection example

	describe('collection features', () => {
		it("persists the correct displayname", () => {
			// const queryRes = collectionConnection3.query({
			// 	count: -1,
			// 	query: ''
			// });
			// log.error('queryRes:%s', queryRes);
			// queryRes.hits.forEach((hit) => {
			// 	const {id} = hit;
			// 	const node = collectionConnection3.get(id);
			// 	log.error('node:%s', node);
			// });

			const documentNode = collectionConnection3.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			// log.error('documentNode:%s', documentNode);

			expect(documentNode.displayname).toBe('Head Title');
		}); // it

		it("persists the correct domain", () => {
			const documentNode = collectionConnection3.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			expect(documentNode.domain).toBe('www.features.com');
		});

		it("persists the correct path", () => {
			const documentNode = collectionConnection3.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			expect(documentNode.path).toBe('/');
		});

		it("persists the correct text (without data-noindex elements)", () => {
			const documentNode = collectionConnection3.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			expect(documentNode.text).toBe('Body H1 \n\t\t index');
		});

		it("persists the correct title", () => {
			const documentNode = collectionConnection3.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			expect(documentNode.title).toBe('Head Title');
		});

		it("persists the correct links", () => {
			const documentNode = collectionConnection3.get('00000000-0000-4000-8000-000000000003') as unknown as WebCrawlDocument;
			expect(documentNode.links).toStrictEqual([
				'https://www.features.com',
				'https://www.features.com/path'
			]);
		});
	}); // describe collection features
}); // describe webcrawl
