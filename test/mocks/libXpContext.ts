import {
	// Context,
	get,
	run
} from '@enonic-types/lib-context';


import { jest } from '@jest/globals';
import {
	LibContext,
	Server
} from '@enonic/mock-xp';


export default function mockLibXpContext({
	// context
	server,
}: {
	// context: Context
	server: Server
}) {
	const libContext = new LibContext({
		server
	});
	jest.mock('/lib/xp/context', () => ({
		// get: jest.fn<typeof get>().mockReturnValue(context),
		get: jest.fn<typeof get>().mockImplementation(() => libContext.get()),
		// run: jest.fn<typeof run>((_context, callback) => callback())
		run: jest.fn<typeof run>().mockImplementation((...params) => libContext.run(...params))
	}), { virtual: true });
}
