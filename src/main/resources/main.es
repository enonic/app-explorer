import {ROLE_YASE_ADMIN} from '/lib/enonic/yase/constants';
import {ignoreErrors} from '/lib/enonic/yase/ignoreErrors';
import {runAsSu} from '/lib/enonic/yase/runAsSu';

import {createRole} from '/lib/xp/auth';


runAsSu(() => {
	ignoreErrors(() => {
		createRole({
			name: ROLE_YASE_ADMIN,
			displayName: 'YASE Administrator',
			description: 'This role gives permissions to the YASE Admin application.'
		});
	});
});
