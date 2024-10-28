import {
	describe,
	expect,
	test as it
} from '@jest/globals';
// import {serialize} from 'uri-js';
import {normalizeUriObj} from './normalizeUriObj';


const URI_STRING = 'https://www.example.com:8080?page=2#top';
const URI_STRING_WITH_SLASH = 'https://www.example.com:8080/?page=2#top';
const URI_OBJ = {
	scheme: 'https',
	userinfo: undefined,
	host: 'www.example.com',
	port: 8080,
	query: 'page=2',
	path: '',
	reference: 'uri'
}
// const URI_STRING_NORMALIZED = 'https://www.example.com:8080?page=2';

const URI_STRING_WITH_PATH = 'https://www.example.com:8080/%7Epath?page=2#top';
const URI_STRING_WITH_PATH_AND_SLASH = 'https://www.example.com:8080/%7Epath/?page=2#top';
const URI_OBJ_WITH_PATH = {
	...URI_OBJ,
	path: '/~path'
}
// const URI_STRING_WITH_PATH_NORMALIZED = 'https://www.example.com:8080/~path?page=2';


describe('webcrawl', () => {
	describe('utils', () => {
		describe('normalizeUriObj', () => {
			it('should remove ending slash when there is no path', () => {
				expect(normalizeUriObj(URI_STRING)).toEqual(URI_OBJ);
				expect(normalizeUriObj(URI_STRING_WITH_SLASH)).toEqual(URI_OBJ);
				// expect(serialize(normalizeUriObj(URI_STRING))).toBe(URI_STRING_NORMALIZED);
				// expect(serialize(normalizeUriObj(URI_STRING_WITH_SLASH))).toBe(URI_STRING_NORMALIZED);
			});
			it('should NOT add an ending slash when there is a path', () => {
				expect(normalizeUriObj(URI_STRING_WITH_PATH)).toEqual(URI_OBJ_WITH_PATH);
				expect(normalizeUriObj(URI_STRING_WITH_PATH_AND_SLASH)).toEqual(URI_OBJ_WITH_PATH);
				// expect(serialize(normalizeUriObj(URI_STRING_WITH_PATH))).toBe(URI_STRING_WITH_PATH_NORMALIZED);
				// expect(serialize(normalizeUriObj(URI_STRING_WITH_PATH_AND_SLASH))).toBe(URI_STRING_WITH_PATH_NORMALIZED);
			});
		});
	});
});
