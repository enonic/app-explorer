import type {
	// User,
	generatePassword,
	getUser
} from '@enonic-types/lib-auth';


import { jest } from '@jest/globals';
import {
	LibAuth,
	Server
} from '@enonic/mock-xp';


export default function mockLibXpAuth({
	server
	// user
}: {
	// user: User
	server: Server
}) {
	const libAuth = new LibAuth({
		server
	});

	jest.mock('/lib/xp/auth', () => ({
		generatePassword: jest.fn<typeof generatePassword>().mockReturnValue('generatedPassword'),
		// getUser: jest.fn<typeof getUser>().mockReturnValue(user),
		getUser: jest.fn<typeof getUser>().mockImplementation((params) => libAuth.getUser(params)),
	}), { virtual: true });
}
