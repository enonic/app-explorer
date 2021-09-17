import {
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';

import {coerseDocumentType} from './coerseDocumentType';


export function getDocumentType({_id}) {
	const readConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	return coerseDocumentType(readConnection.get(_id));
}
