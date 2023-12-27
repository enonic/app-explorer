import type Log from '@enonic/mock-xp/dist/Log';

import type { send } from '@enonic-types/lib-event';
import { jest } from '@jest/globals';

export default function mockLibXpEvent({
	log
}: {
	log: ReturnType<typeof Log.createLogger>
}) {
	jest.mock('/lib/xp/event', () => ({
		send: jest.fn<typeof send>((sendEventParams) => {
			log.debug('mocked sendEventParams', sendEventParams);
		})
	}), { virtual: true });
}
