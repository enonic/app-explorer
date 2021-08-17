import {
	forceArray
} from '@enonic/js-utils';
import {
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';


export function getSchema({_id}) {
	const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const {
		_name,
		_path,
		_versionKey,
		properties
	} = readConnection.get(_id);
	return {
		_id,
		_name,
		_path,
		_versionKey,
		properties: forceArray(properties).sort((a, b) => (a.name > b.name) ? 1 : -1)
	};
}
