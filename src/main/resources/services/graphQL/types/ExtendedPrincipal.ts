import type { Principal } from '/lib/xp/auth';

export type ExtendedPrincipal = Principal & {
	inherited?: boolean
	// memberships?: ExtendedPrincipal[]
	parent?: ExtendedPrincipal
}
