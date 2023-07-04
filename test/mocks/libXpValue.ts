import type {
	Instant,
	instant
} from '@enonic-types/lib-value';
import { jest } from '@jest/globals';


export default function mockLibXpValue() {
	jest.mock('/lib/xp/value', () => ({
		instant: jest.fn<typeof instant>((value) => value as unknown as Instant)
	}), { virtual: true });
}
