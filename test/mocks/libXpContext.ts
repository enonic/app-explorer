import {
	Context,
	get,
	run
} from '@enonic-types/lib-context';
import { jest } from '@jest/globals';


export default function mockLibXpContext({
	context
}: {
	context: Context
}) {
	jest.mock('/lib/xp/context', () => ({
		get: jest.fn<typeof get>().mockReturnValue(context),
		run: jest.fn<typeof run>((_context, callback) => callback())
	}), { virtual: true });
}
