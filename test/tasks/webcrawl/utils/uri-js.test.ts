import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {normalize, parse, resolve, serialize} from 'uri-js';

const URI_STRING_WITHOUT_SLASH = 'https://www.example.com:8080?page=2#top';
const URI_STRING_WITH_SLASH = 'https://www.example.com:8080/?page=2#top';

const URI_STRING_WITH_PATH = 'https://www.example.com:8080/path?page=2#top';
const URI_STRING_WITH_PATH_AND_SLASH = 'https://www.example.com:8080/path/?page=2#top';

const URI_OBJECT_WITHOUT_SLASH = parse(URI_STRING_WITHOUT_SLASH);
const URI_OBJECT_WITH_SLASH = parse(URI_STRING_WITH_SLASH);

describe('normalize', () => {
	describe('normalize', () => {
		it('should add an ending slash when there is no path', () => {
			expect(normalize(URI_STRING_WITH_SLASH)).toBe(URI_STRING_WITH_SLASH);
			expect(normalize(URI_STRING_WITHOUT_SLASH)).toBe(URI_STRING_WITH_SLASH);
		});
		it('should NOT add an ending slash when there is a path', () => {
			expect(normalize(URI_STRING_WITH_PATH)).toBe(URI_STRING_WITH_PATH);
			expect(normalize(URI_STRING_WITH_PATH_AND_SLASH)).toBe(URI_STRING_WITH_PATH_AND_SLASH);
		});
	});
	describe('parse', () => {
		it('creates an object where path differs depending upon ending slash', () => {
			expect(URI_OBJECT_WITH_SLASH).toStrictEqual({
				fragment: 'top',
				host: 'www.example.com',
				path: '/', // NOTE: Slash here
				port: 8080,
				query: 'page=2',
				reference: 'uri',
				scheme: 'https',
				userinfo: undefined
			});
			expect(URI_OBJECT_WITHOUT_SLASH).toStrictEqual({
				fragment: 'top',
				host: 'www.example.com',
				path: '', // NOTE: No slash here
				port: 8080,
				query: 'page=2',
				reference: 'uri',
				scheme: 'https',
				userinfo: undefined
			});
		});
	});
	describe('serialize', () => {
		it('should add an ending slash', () => {
			expect(serialize(URI_OBJECT_WITH_SLASH)).toBe(URI_STRING_WITH_SLASH);
			expect(serialize(URI_OBJECT_WITHOUT_SLASH)).toBe(URI_STRING_WITH_SLASH);
		});
	});
});
