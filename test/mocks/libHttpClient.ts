import { toStr } from '@enonic/js-utils';
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';


interface HttpClientRequest {
	url: string
}

interface HttpClientResponse {
	body?: string
	contentType?: string
	headers?: Record<string, string>
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
Disallow: /platform
Noindex: /resources/case-studies

User-agent: EnonicXpExplorerCollectorWebcrawlerBot
Disallow: /company
Noindex: /platform`,
					contentType: 'text/plain; charset=utf-8',
					headers: {},
					status: 200
				};
			} else if (
				url === 'https://www.enonic.com/'
				|| url === 'https://www.enonic.com/platform/overview'
				|| url === 'https://www.enonic.com/resources/case-studies/nav-headless-next-js'
			) {
				return {
					body: readFileSync(join(__dirname, 'enonic.com.html')).toString(),
					contentType: 'text/html; charset=utf-8',
					headers: {},
					status: 200
				}
			} else if (url.startsWith('https://www.enonic.com/')) {
				return {
					status: 404,
				};
			} else if (url === 'https://www.example.com/robots.txt') {
				return {
					status: 404,
				};
			} else if (url === 'https://www.example.com/') {
				return {
					body: `<html/>`,
					contentType: 'text/html; charset=utf-8',
					headers: {},
					status: 200,
				};
			} else if (url === 'https://www.features.com/robots.txt') {
				return {
					status: 404,
				};
			} else if (url === 'https://www.features.com/') {
				return {
					body: readFileSync(join(__dirname, 'features.com.html')).toString(),
					contentType: 'text/html; charset=utf-8',
					headers: {},
					status: 200
				}
			} else {
				throw new Error(`Unmocked request url:${url} request:${toStr(request)}`);
			}
		})
	}), {virtual: true});
}
