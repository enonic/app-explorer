import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {resolveRedirectTarget} from '../../../../src/webcrawler/task/uri/resolveRedirectTarget';


describe('resolveRedirectTarget', () => {
	it('flags a redirect to another subdomain as not same-domain', () => {
		const target = resolveRedirectTarget(
			'https://qa-web.example.com/section/page',
			'https://groups.example.com/',
			'qa-web.example.com'
		);
		expect(target.sameDomain).toBe(false);
		expect(target.host).toBe('groups.example.com');
	});

	it('treats a different subdomain as another domain', () => {
		const target = resolveRedirectTarget('https://www.example.com', 'https://app.example.com/', 'www.example.com');
		expect(target.sameDomain).toBe(false);
		expect(target.host).toBe('app.example.com');
	});

	it('follows a same-domain redirect and returns a normalized, queueable url', () => {
		const target = resolveRedirectTarget('https://www.example.com', 'https://www.example.com/target', 'www.example.com');
		expect(target.sameDomain).toBe(true);
		expect(target.host).toBe('www.example.com');
		expect(target.normalizedUrl).toBe('https://www.example.com/target');
	});

	it('resolves a relative Location against the current url and stays same-domain', () => {
		const target = resolveRedirectTarget('https://www.example.com/a/b', '/c', 'www.example.com');
		expect(target.sameDomain).toBe(true);
		expect(target.normalizedUrl).toBe('https://www.example.com/c');
	});

	it('preserves the query string of the redirect target', () => {
		const target = resolveRedirectTarget('https://www.example.com/list', 'https://www.example.com/list?page=2', 'www.example.com');
		expect(target.sameDomain).toBe(true);
		expect(target.normalizedUrl).toBe('https://www.example.com/list?page=2');
	});

	it('treats a http -> https redirect on the same host as same-domain', () => {
		const target = resolveRedirectTarget('http://www.example.com', 'https://www.example.com/', 'www.example.com');
		expect(target.sameDomain).toBe(true);
	});
});
