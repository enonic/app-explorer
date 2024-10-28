import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {parseUrl} from './parseUrl';


describe('webcrawl', () => {
	describe('utils', () => {
		describe('parseUrl', () => {
			it('supports all elements of an url', () => {
				expect(parseUrl('https://user:password@www.example.com:8080/path/?page=2#top')).toStrictEqual({
					scheme: 'https',
					userinfo: 'user:password',
					host: 'www.example.com',
					port: '8080',
					path: '/path/',
					query: 'page=2',
					fragment: 'top',
				});
			});

			it('supports urls without scheme', () => {
				expect(parseUrl('://www.example.com:8080/path/?page=2#top')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: 'www.example.com',
					port: '8080',
					path: '/path/',
					query: 'page=2',
					fragment: 'top',
				});
				expect(parseUrl('www.example.com:8080/path/?page=2#top')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: 'www.example.com',
					port: '8080',
					path: '/path/',
					query: 'page=2',
					fragment: 'top',
				});
			});

			it('supports urls without host', () => {
				expect(parseUrl('https://:8080/path/?page=2#top')).toStrictEqual({
					scheme: 'https',
					userinfo: undefined,
					host: undefined,
					port: '8080',
					path: '/path/',
					query: 'page=2',
					fragment: 'top',
				});
			});

			it('supports emptry string', () => {
				expect(parseUrl('')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: undefined,
					query: undefined,
					fragment: undefined,
				});
			});

			it('supports urls with only fragment', () => {
				expect(parseUrl('#')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: undefined,
					query: undefined,
					fragment: '',
				});
				expect(parseUrl('#whatever')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: undefined,
					query: undefined,
					fragment: 'whatever',
				});
			});

			it('supports urls with only query', () => {
				expect(parseUrl('?')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: undefined,
					query: '',
					fragment: undefined,
				});
				expect(parseUrl('?whatever')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: undefined,
					query: 'whatever',
					fragment: undefined,
				});
			});

			it('supports urls with only path', () => {
				expect(parseUrl('/')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: '/',
					query: undefined,
					fragment: undefined,
				});
				expect(parseUrl('/path')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: '/path',
					query: undefined,
					fragment: undefined,
				});
				expect(parseUrl('/path/')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: undefined,
					path: '/path/',
					query: undefined,
					fragment: undefined,
				});
			});

			it('supports urls with only port', () => {
				expect(parseUrl(':8080')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: undefined,
					port: '8080',
					path: undefined,
					query: undefined,
					fragment: undefined,
				});
			});

			it('supports urls with only host', () => {
				expect(parseUrl('w')).toStrictEqual({
					scheme: undefined,
					userinfo: undefined,
					host: 'w',
					port: undefined,
					path: undefined,
					query: undefined,
					fragment: undefined,
				});
			});
		});
	});
});
