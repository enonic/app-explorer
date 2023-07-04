// import type {  } from '@enonic-types/lib-event';
import { jest } from '@jest/globals';


export default function mockLibXpEvent() {
	jest.mock('/lib/xp/event', () => ({
		// sanitize: jest.fn<typeof sanitize>((text) => text)
	}), { virtual: true });
}
