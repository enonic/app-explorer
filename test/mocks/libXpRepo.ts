import type { Server } from '@enonic/mock-xp';
import type {
	// Repository,
	get
} from '@enonic-types/lib-repo';


import { jest } from '@jest/globals';
import { LibRepo } from '@enonic/mock-xp';


export default function mockLibXpRepo({
	server
}: {
	server: Server
}) {
	const libRepo = new LibRepo({
		server
	});
	jest.mock('/lib/xp/repo', () => ({
		get: jest.fn<typeof get>((id) => libRepo.get(id))
	}), { virtual: true });
}
