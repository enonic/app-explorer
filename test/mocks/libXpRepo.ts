import type { JavaBridge } from '@enonic/mock-xp';
import type {
	Repository,
	get
} from '@enonic-types/lib-repo';
import { jest } from '@jest/globals';


export default function mockLibXpRepo({
	javaBridge
}: {
	javaBridge: JavaBridge
}) {
	jest.mock('/lib/xp/repo', () => ({
		get: jest.fn<typeof get>((id) => javaBridge.repo.get(id) as Repository)
	}), { virtual: true });
}
