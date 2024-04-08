// import type Log from '@enonic/mock-xp/dist/Log';
import type { send } from '@enonic-types/lib-event';


import { jest } from '@jest/globals';
import {
	LibEvent,
	Server
} from '@enonic/mock-xp';


export default function mockLibXpEvent({
	// log
	server
}: {
	// log: ReturnType<typeof Log.createLogger>
	server: Server
}) {
	const libEvent = new LibEvent({
		server
	});
	jest.mock('/lib/xp/event', () => ({
		// send: jest.fn<typeof send>((sendEventParams) => {
		// 	log.debug('mocked sendEventParams', sendEventParams);
		// })
		send: jest.fn<typeof send>().mockImplementation((params) => libEvent.send(params))
	}), { virtual: true });
}
