// import type { get } from '@enonic-types/lib-scheduler';
import { jest } from '@jest/globals';


export default function mockLibXpScheduler() {
	jest.mock('/lib/xp/scheduler', () => ({
		// get: jest.fn<typeof get>(() => {})
	}), { virtual: true });
}
