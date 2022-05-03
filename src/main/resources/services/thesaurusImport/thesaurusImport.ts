import type {ParentPath} from '/lib/explorer/types/index.d';

import {
	RESPONSE_TYPE_JSON,
	isString
} from '@enonic/js-utils';

//@ts-ignore
import {getMultipartText} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModify} from '/lib/explorer/node/createOrModify';
import {synonym} from '/lib/explorer/model/2/nodeTypes/synonym';
import {parseCsv} from '/lib/explorer/parseCsv';


export function post({
	params: {
		//file,
		name
	}
} :{
	params :{
		name :string
	}
}) {
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});
	const text :string = getMultipartText('file');
	let errors = 0;
	let successes = 0;
	parseCsv({
		csvString: text,
		columns: ['from', 'to'],
		start: 1 // Aka skip line 0
	}).forEach(({
		from,
		to
	} :{
		from ?:string
		to ?:string
	}) => {
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
				_name: name,
				_parentPath: `/thesauri/${name}`,
				from: fromArr,//.length > 1 ? fromArr : fromArr.join(),
				to: toArr//.length > 1 ? toArr : toArr.join()
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

	const body :{
		error ?:string
		errors :number
		message ?:string
		successes :number
	} = {
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
		contentType: RESPONSE_TYPE_JSON,
		body,
		status
	};
} // exports.delete
