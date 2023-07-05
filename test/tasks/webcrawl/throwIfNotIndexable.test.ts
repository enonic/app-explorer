import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import Log from '@enonic/mock-xp/dist/Log';
import guard from 'robots-txt-guard';
import throwIfNotIndexable from '../../../src/main/resources/tasks/webcrawl/throwIfNotIndexable';

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
		}]
	});
	it("does NOT throw when indexable", () => {
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
				userAgent: '',
			})).not.toThrow();
		});
	});
	it("throws when NOT indexable", () => {
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
});
