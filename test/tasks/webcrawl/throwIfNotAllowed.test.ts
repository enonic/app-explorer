import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import Log from '@enonic/mock-xp/dist/Log';
import guard from 'robots-txt-guard';
import throwIfNotAllowed from '../../../src/main/resources/tasks/webcrawl/throwIfNotAllowed';

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
		}]
	});
	it("does NOT throw when allowed", () => {
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
				userAgent: '',
			})).not.toThrow();
		});
	});
	it("throws when NOT allowed", () => {
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
});
