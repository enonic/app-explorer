import { toStr } from '@enonic/js-utils';
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';


interface HttpClientRequest {
	url: string
}

interface HttpClientResponse {
	body: string
	contentType: string
	headers: Record<string, string>
	status: number
}

export default function mockLibHttpClient() {
	jest.mock('/lib/http-client', () => ({
		request: jest.fn((request: HttpClientRequest): HttpClientResponse => {
			const {url} = request;
			if (url === 'https://www.enonic.com/robots.txt') {
				return {
					body: `Sitemap: https://enonic.com/sitemap.xml,
User-agent: *
Disallow: */docs/`,
					contentType: 'text/plain; charset=utf-8',
					headers: {},
					status: 200
				};
			} else if (url === 'https://www.enonic.com/') {
				return {
					body: readFileSync(join(__dirname, 'enonic.com.html')).toString(),
					contentType: 'text/html; charset=utf-8',
					headers: {},
					status: 200
				}
			} else if (url.startsWith('https://www.enonic.com/')) {
				// @ts-ignore
				return {
					status: 404,
				};
			} else {
				throw new Error(`Unmocked request url:${url} request:${toStr(request)}`);
			}
		})
	}), {virtual: true});
}