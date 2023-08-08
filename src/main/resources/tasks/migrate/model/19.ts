import type { RepoConnection } from '@enonic-types/lib-node';
import type { Progress } from '../../init/Progress';


import { setModel } from '/lib/explorer/model/setModel';
import { concisePersmissions } from '../../concisePermissions/concisePermissions';


export default function model19({
	progress,
	writeConnection
}: {
	progress: Progress
	writeConnection: RepoConnection
}) {
	concisePersmissions({
		progress
	});
	setModel({
		connection: writeConnection,
		version: 19
	});
}
