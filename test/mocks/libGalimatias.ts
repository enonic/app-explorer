import { jest } from '@jest/globals';
import {
	normalize,
	parse,
	resolve,
	serialize
} from 'uri-js';

export default function mockLibGalimatias(
// {
// 	host,
// 	normalizedUrl,
// 	scheme,
// }: {
// 	host: string
// 	normalizedUrl: string
// 	scheme: string
// }
) {
	jest.mock('/lib/galimatias', () => ({
		// @ts-ignore
		// URL: jest.fn().mockImplementation((_url: string) => ({
		// 	getHost: jest.fn().mockReturnValue(host),
		// 	getScheme: jest.fn().mockReturnValue(scheme),
		// 	normalize: jest.fn().mockReturnValue(normalizedUrl),
		// }))
		URL: jest.fn().mockImplementation((url: string) => {
			const uriObj = parse(url);
			const obj = {
				getHost: jest.fn(() => uriObj.host),
				getScheme: jest.fn(() => uriObj.scheme),
				normalize: jest.fn(() => {
					//delete uriObj.fragment;
					return normalize(serialize(uriObj));
				}),
				resolve: jest.fn((href: string) => resolve(url, href)),
				setFragment: jest.fn((fragment: string) => {
					uriObj.fragment = fragment;
					return obj; // chainable
				}),
			};
			return obj;
		})
	}), { virtual: true });
}
