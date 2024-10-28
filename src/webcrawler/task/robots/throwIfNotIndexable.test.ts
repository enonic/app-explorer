import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {Log} from '@enonic/mock-xp';
import guard from 'robots-txt-guard';
import { DEFAULT_UA } from '../constants';
import throwIfNotIndexable from './throwIfNotIndexable';

//──────────────────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────────────────
// @ts-expect-error TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	loglevel: 'debug'
	// loglevel: 'info'
	// loglevel: 'warn'
	// loglevel: 'error'
	// loglevel: 'silent'
});

//──────────────────────────────────────────────────────────────────────────────
// Tests
//──────────────────────────────────────────────────────────────────────────────
describe('throwIfNotIndexable', () => {
	const robots = guard({
		extensions: [{
			extension: "sitemap",
			value: "https://enonic.com/sitemap.xml",
		}],
		groups: [{
			"agents": [
				"*",
			],
			"rules": [{
				"path": "/docs/",
				"rule": "noindex",
			}],
		},{
			"agents": [
				"EnonicXpExplorerCollectorWebcrawlerBot",
			],
			"rules": [{
				"path": "/docs/",
				"rule": "noindex",
			},{
				"path": "/example/",
				"rule": "noindex",
			}],
		}]
	});
	it("does NOT throw when indexable (all browsers)", () => {
		[
			'/',
			'/docs',
			'/docs?',
			'/docs#',
			'/docsaddenum',
			'/example/'
		].forEach(path => {
			expect(() => throwIfNotIndexable({
				path,
				robots,
				userAgent: '',
			})).not.toThrow();
		});
	});
	it("does NOT throw when indexable (EnonicXpExplorerCollectorWebcrawlerBot)", () => {
		[
			'/',
			'/docs',
			'/docs?',
			'/docs#',
			'/docsaddenum',
		].forEach(path => {
			expect(() => throwIfNotIndexable({
				path,
				robots,
				userAgent: DEFAULT_UA,
			})).not.toThrow();
		});
	});
	it("throws when NOT indexable (all browsers)", () => {
		[
			'/docs/',
			'/docs/?',
			'/docs/#',
			'/docs/index.html',
			'/docs/index.html?foo=bar',
		].forEach(path => {
			expect(() => throwIfNotIndexable({
				path,
				robots,
				userAgent: '',
			})).toThrow('Not indexable in robots.txt');
		})
	});
	it("throws when NOT indexable (EnonicXpExplorerCollectorWebcrawlerBot)", () => {
		[
			'/docs/',
			'/docs/?',
			'/docs/#',
			'/docs/index.html',
			'/docs/index.html?foo=bar',
			'/example/'
		].forEach(path => {
			expect(() => throwIfNotIndexable({
				path,
				robots,
				userAgent: DEFAULT_UA,
			})).toThrow('Not indexable in robots.txt');
		})
	});
});
