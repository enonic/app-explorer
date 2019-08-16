import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';


export function get({params: {
	field
}}) {
	const valuesRes = getFieldValues({
		connection: connect({principals: PRINCIPAL_EXPLORER_READ}),
		field
	});
	valuesRes.hits = valuesRes.hits.map(({
		//_name,
		//field,
		//fieldReference,
		displayName,
		value
	}) => ({
		displayName,
		value
	}));
	return {
		body: {
			valuesRes
		},
		contentType: RT_JSON
	};
} // get
