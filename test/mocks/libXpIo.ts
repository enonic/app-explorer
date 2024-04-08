import type { readText } from '@enonic-types/lib-io';
import { jest } from '@jest/globals';


import {
	App,
	LibIo,
} from '@enonic/mock-xp';


export default function mockLibXpIo({
	app,
}: {
	app: App
}) {
	const libIo = new LibIo({
		app,
	});
	jest.mock('/lib/xp/io', () => ({
		readText: jest.fn<typeof readText>().mockImplementation((stream) => {
			// console.error(typeof stream);
			if (typeof stream === 'undefined') {
				return 'mocked readText';
			}
			return libIo.readText(stream);
		})
	}), { virtual: true });
}
