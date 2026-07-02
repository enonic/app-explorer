import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {getHeaderValue} from '../../../src/webcrawler/task/getHeaderValue';


describe('getHeaderValue', () => {
	it('returns the value regardless of header name casing', () => {
		expect(getHeaderValue({'Location': 'https://example.com/'}, 'location')).toBe('https://example.com/');
		expect(getHeaderValue({'location': 'https://example.com/'}, 'Location')).toBe('https://example.com/');
		expect(getHeaderValue({'X-Robots-Tag': 'noindex'}, 'x-robots-tag')).toBe('noindex');
	});

	it('returns the first value when the header is repeated', () => {
		expect(getHeaderValue({'set-cookie': ['a=1', 'b=2']}, 'set-cookie')).toBe('a=1');
	});

	it('returns undefined when the header or the headers object is absent', () => {
		expect(getHeaderValue({}, 'location')).toBe(undefined);
		expect(getHeaderValue(undefined, 'location')).toBe(undefined);
	});
});
