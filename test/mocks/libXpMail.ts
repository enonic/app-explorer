import type Log from '@enonic/mock-xp/dist/Log';

import type { send } from '@enonic-types/lib-mail';
import { jest } from '@jest/globals';


export default function mockLibXpMail({
	log
}: {
	log: ReturnType<typeof Log.createLogger>
}) {
	jest.mock('/lib/xp/mail', () => ({
		send: jest.fn<typeof send>((sendMessageParams) => {
			log.debug('mockLibXpMail send', sendMessageParams);
			return true;
		})
	}), { virtual: true });
}
