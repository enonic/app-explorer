import type {
	User,
	generatePassword,
	getUser
} from '@enonic-types/lib-auth';
import { jest } from '@jest/globals';


export default function mockLibXpAuth({
	user
}: {
	user: User
}) {
	jest.mock('/lib/xp/auth', () => ({
		generatePassword: jest.fn<typeof generatePassword>().mockReturnValue('generatedPassword'),
		getUser: jest.fn<typeof getUser>().mockReturnValue(user),
	}), { virtual: true });
}
