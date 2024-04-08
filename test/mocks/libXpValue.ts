import type {
	// Instant,
	instant
} from '@enonic-types/lib-value';

import { jest } from '@jest/globals';
import { LibValue } from '@enonic/mock-xp';

export default function mockLibXpValue() {
	jest.mock('/lib/xp/value', () => ({
		// instant: jest.fn<typeof instant>((value) => value as unknown as Instant)
		instant: jest.fn<typeof instant>().mockImplementation((value) => LibValue.instant(value))
	}), { virtual: true });
}
