import type { Server } from '@enonic/mock-xp';
import type {
	// RepoConnection,
	connect as connectFunction
} from '@enonic-types/lib-node';


import { jest } from '@jest/globals';
import { LibNode } from '@enonic/mock-xp';



export default function mockLibXpNode({
	server
}: {
	server: Server
}) {
	const libNode = new LibNode({
		server
	});
	// const connect = jest.fn<typeof connectFunction>((params) => server.connect(params) as unknown as RepoConnection)

	jest.mock('/lib/xp/node', () => ({
		connect: jest.fn<typeof connectFunction>().mockImplementation((params) => libNode.connect(params)),
	}), { virtual: true });
	// return {
	// 	connect
	// }
}
