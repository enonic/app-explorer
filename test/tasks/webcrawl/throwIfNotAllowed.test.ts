import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import Log from '@enonic/mock-xp/dist/Log';
import guard from 'robots-txt-guard';
import { DEFAULT_UA } from '../../../src/main/resources/tasks/webcrawl/constants';
import throwIfNotAllowed from '../../../src/main/resources/tasks/webcrawl/robots/throwIfNotAllowed';

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
describe('throwIfNotAllowed', () => {
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
				"rule": "disallow",
			}],
		},{
			"agents": [
				"EnonicXpExplorerCollectorWebcrawlerBot",
			],
			"rules": [{
				"path": "/docs/",
				"rule": "disallow",
			},{
				"path": "/example/",
				"rule": "disallow",
			}],
		}]
	});
	it("does NOT throw when allowed (all browsers)", () => {
		[
			'/',
			'/docs',
			'/docs?',
			'/docs#',
			'/docsaddenum',
			'/example/'
		].forEach(path => {
			expect(() => throwIfNotAllowed({
				path,
				robots,
				userAgent: '',
			})).not.toThrow();
		});
	});
	it("does NOT throw when allowed (EnonicXpExplorerCollectorWebcrawlerBot)", () => {
		[
			'/',
			'/docs',
			'/docs?',
			'/docs#',
			'/docsaddenum',
		].forEach(path => {
			expect(() => throwIfNotAllowed({
				path,
				robots,
				userAgent: DEFAULT_UA,
			})).not.toThrow();
		});
	});
	it("throws when NOT allowed (all browsers)", () => {
		[
			'/docs/',
			'/docs/?',
			'/docs/#',
			'/docs/index.html',
			'/docs/index.html?foo=bar',
		].forEach(path => {
			expect(() => throwIfNotAllowed({
				path,
				robots,
				userAgent: '',
			})).toThrow('Not allowed in robots.txt');
		})
	});
	it("throws when NOT allowed (EnonicXpExplorerCollectorWebcrawlerBot)", () => {
		[
			'/docs/',
			'/docs/?',
			'/docs/#',
			'/docs/index.html',
			'/docs/index.html?foo=bar',
			'/example/'
		].forEach(path => {
			expect(() => throwIfNotAllowed({
				path,
				robots,
				userAgent: DEFAULT_UA,
			})).toThrow('Not allowed in robots.txt');
		})
	});
});
