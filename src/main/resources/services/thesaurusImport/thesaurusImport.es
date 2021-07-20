import {isString} from '@enonic/js-utils';

import {getMultipartText} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModify} from '/lib/explorer/node/createOrModify';
import {synonym} from '/lib/explorer/nodeTypes/synonym';
import {parseCsv} from '/lib/explorer/parseCsv';


export function post({
	params: {
		//file,
		name
	}
}) {
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});
	const text = getMultipartText('file');
	let errors = 0;
	let successes = 0;
	parseCsv({
		csvString: text,
		columns: ['from', 'to'],
		start: 1 // Aka skip line 0
	}).forEach(({from, to}) => {
		//log.info(toStr({from, to}));
		if (
			from // Skip empty cells
			&& to // Skip empty cells
			&& isString(from) && from.trim() // Skip cells with just whitespace, emptystring is Falsy
			&& isString(to) && to.trim() // Skip cells with just whitespace, emptystring is Falsy
		) { // Skip empty values
			const fromArr = from.trim().split(',').map(str => str.trim());
			const toArr = to.trim().split(',').map(str => str.trim());
			const params = synonym({
				_parentPath: `/thesauri/${name}`,
				from: fromArr.length > 1 ? fromArr : fromArr.join(),
				to: toArr.length > 1 ? toArr : toArr.join()
			});
			//log.info(toStr({params}));
			const createOrModifyRes = createOrModify(params, {
				connection
			});
			if (createOrModifyRes) {
				successes += 1;
			} else {
				errors += 1;
			}
		}
	});

	const body = {
		errors,
		successes
	};
	let status = 200;
	if (errors) {
		body.error = `Something went wrong when trying to import to thesaurus ${name}!`;
		status = 500;
	} else {
		body.message = `Imported to thesaurus ${name}`;
	}
	return {
		contentType: RT_JSON,
		body,
		status
	};
} // exports.delete
