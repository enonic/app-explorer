import type { JavaBridge } from '@enonic/mock-xp';
import type {
	RepoConnection,
	connect as connectFunction
} from '@enonic-types/lib-node';
import { jest } from '@jest/globals';




export default function mockLibXpNode({
	javaBridge
}: {
	javaBridge: JavaBridge
}) {
	const connect = jest.fn<typeof connectFunction>((params) => javaBridge.connect(params) as unknown as RepoConnection)

	jest.mock('/lib/xp/node', () => ({
		connect
	}), { virtual: true });
	return {
		connect
	}
}
