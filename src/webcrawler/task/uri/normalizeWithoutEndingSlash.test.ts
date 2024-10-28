import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {normalizeWithoutEndingSlash} from './normalizeWithoutEndingSlash';


const URI_STRING = 'https://www.example.com:8080?page=2#top';
const URI_STRING_WITH_SLASH = 'https://www.example.com:8080/?page=2#top';
const URI_STRING_NORMALIZED = 'https://www.example.com:8080?page=2';

const URI_STRING_WITH_PATH = 'https://www.example.com:8080/%7Epath?page=2#top';
const URI_STRING_WITH_PATH_AND_SLASH = 'https://www.example.com:8080/%7Epath/?page=2#top';
const URI_STRING_WITH_PATH_NORMALIZED = 'https://www.example.com:8080/~path?page=2';


describe('webcrawl', () => {
	describe('utils', () => {
		describe('normalizeWithoutEndingSlash', () => {
			it('should remove ending slash when there is no path', () => {
				expect(normalizeWithoutEndingSlash(URI_STRING_WITH_SLASH)).toBe(URI_STRING_NORMALIZED);
				expect(normalizeWithoutEndingSlash(URI_STRING)).toBe(URI_STRING_NORMALIZED);
			});
			it('should NOT add an ending slash when there is a path', () => {
				expect(normalizeWithoutEndingSlash(URI_STRING_WITH_PATH)).toBe(URI_STRING_WITH_PATH_NORMALIZED);
				expect(normalizeWithoutEndingSlash(URI_STRING_WITH_PATH_AND_SLASH)).toBe(URI_STRING_WITH_PATH_NORMALIZED);
			});
		});
	});
});
