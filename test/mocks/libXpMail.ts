// import type { sanitize } from '@enonic-types/lib-mail';
import { jest } from '@jest/globals';


export default function mockLibXpMail() {
	jest.mock('/lib/xp/mail', () => ({
		// sanitize: jest.fn<typeof sanitize>((text) => text)
	}), { virtual: true });
}
