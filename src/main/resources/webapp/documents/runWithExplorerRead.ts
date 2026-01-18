import type { User } from '@enonic-types/lib-auth';
import { toStr } from '@enonic/js-utils/value/toStr';
import {
	Principal,
	Repo
} from '@enonic/explorer-utils';
import { USER as EXPLORER_APP_USER } from '/lib/explorer/model/2/users/explorer';
import { getUser } from '/lib/xp/auth';
import { run } from '/lib/xp/context';


type UserWithoutModifiedTime = Omit<User,'modifiedTime'> // TODO remove when modifiedTime is optional #10221


export default function runWithExplorerRead<T extends () => unknown>(fn: T): ReturnType<T> {
	let user = getUser() as UserWithoutModifiedTime;
	if (!user) {
		// CreateNode tries to set owner, and fails when no user
		user = {
			displayName: EXPLORER_APP_USER.displayName,
			disabled: false,
			hasPassword: false,
			idProvider: EXPLORER_APP_USER.idProvider, // 'system',
			key: `user:${EXPLORER_APP_USER.idProvider}:${EXPLORER_APP_USER.name}`, // `user:system:${USER_EXPLORER_APP_NAME}`,
			login: EXPLORER_APP_USER.name, //USER_EXPLORER_APP_NAME,
			type: 'user'
		};
		log.info('user:%s', toStr(user));
	}

	return run({ // Override current users permissions
		attributes: {},
		branch: 'master',

		// This allows any user to read from app-explorer, journal and collections.
		// So even though you are logged into Enonic XP admin with a user that does not have PRINCIPAL_EXPLORER_READ:
		// You may still get the documentTypes and documents.
		principals: [Principal.EXPLORER_READ],
		//principals: [],

		//repository: 'system-repo',
		repository: Repo.EXPLORER,
		user
	}, fn) as ReturnType<T>;
}
