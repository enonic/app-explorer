	import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import {
	APP_EXPLORER,
	COLLECTION_REPO_PREFIX,
	Folder,
	NodeType,
	Path,
	Repo
} from '@enonic/explorer-utils'
import {
	App,
	Log,
	Server
} from '@enonic/mock-xp';
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
	baseUri: "https://www.error.com",
	excludes: [],
	maxPages: 2,
}
const CONFIG_JSON = JSON.stringify(COLLECTOR_CONFIG);
const COLLECTION_NAME = 'error_collection';
const REPO_COLLECTION_TEST = `${COLLECTION_REPO_PREFIX}${COLLECTION_NAME}`;

const server = new Server({
	// loglevel: 'error',
	loglevel: 'silent',
}).createRepo({
	id: Repo.EXPLORER
}).createRepo({
	id: Repo.JOURNALS
}).createRepo({
	id: REPO_COLLECTION_TEST
});

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
	_name: COLLECTION_NAME,
	_nodeType: NodeType.COLLECTION,
	_parentPath: Path.COLLECTIONS,
	language: 'en',
	collector: {
		name: 'com.enonic.app.explorer:webcrawl',
		configJson: CONFIG_JSON,
		config: COLLECTOR_CONFIG
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

const LANGUAGE = 'en';

describe('webcrawl', () => {
	describe('HttpHeadersTimeoutException on entrypointUrl', () => {
		it('should NOT delete any old documents', async () => {
			import('./webcrawl').then(({run}) => {
				const documentConnection = server.connect({
					branchId: 'master',
					repoId: REPO_COLLECTION_TEST
				});
				documentConnection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					displayname: 'oldDisplayname',
					// document_metadata: {
					// 	collection: COLLECTION_NAME,
					// 	collector: {
					// 		id: '00000000-0000-4000-8000-000000000008',
					// 		version: '0.0.1-SNAPSHOT'
					// 	},
					// 	createdTime: '2024-03-11T08:30:22.258Z',
					// 	documentType: 'webpage',
					// 	language: 'en',
					// 	stemmingLanguage: 'en',
					// 	valid: true
					// },
					domain: 'error.com',
					html: 'oldHtml',
					links: 'oldLinks',
					og_description: 'old_og_description',
					og_locale: 'old_og_locale',
					og_site_name: 'old_og_site_name',
					og_title: 'old_og_title',
					text: 'oldText',
					title: 'oldTitle',
					url: 'https://www.error.com/oldDocument'
				});
				const fn = () => {
					run({
						collectionId: createdCollection._id,
						collectorId: createdDocumentType._id, // COLLECTOR_ID,
						configJson: CONFIG_JSON,
						language: LANGUAGE,
					});
				}
				expect(fn).toThrow();

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
				// 		const {
				// 			_path,
				// 			_nodeType
				// 		} = node;
				// 		if (_nodeType === 'com.enonic.app.explorer:document') {
				// 			log.error('node:%s', {...node, _indexConfig: undefined});
				// 		} else {
				// 			log.error('node:%s', {
				// 				_path,
				// 				_nodeType
				// 			});
				// 		}
				// 	});
				// });

				const oldDocument = documentConnection.get('00000000-0000-4000-8000-000000000002');
				// log.error('oldDocument:%s', oldDocument);
				expect(oldDocument['url']).toBe('https://www.error.com/oldDocument');
			});
		});
	});
});
