import type { readText } from '@enonic-types/lib-io';
import { jest } from '@jest/globals';


export default function mockLibXpIo() {
	jest.mock('/lib/xp/io', () => ({
		readText: jest.fn<typeof readText>((stream) => {
			return 'mocked readText';
		})
	}), { virtual: true });
}
