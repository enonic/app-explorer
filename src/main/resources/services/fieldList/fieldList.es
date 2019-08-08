import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFields} from '/admin/tools/explorer/fields/getFields';
import {getFieldValues} from '/admin/tools/explorer/fields/getFieldValues';


export function get() {
	const connection = connect({principals: PRINCIPAL_EXPLORER_READ});
	const fieldsRes = getFields({connection});
	fieldsRes.hits = fieldsRes.hits.map(({
		_name: name,
		displayName,
		fieldType,
		indexConfig,
		key
	}) => {
		const valuesRes = getFieldValues({
			connection,
			field: name
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
		}))
		return {
			displayName,
			fieldType,
			indexConfig,
			name,
			valuesRes
		};
	});
	return {
		body: {
			fieldsRes
		},
		contentType: RT_JSON
	};
} // get
