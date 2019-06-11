//import {toStr} from '/lib/util';
import {
	BRANCH_ID_EXPLORER,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {fieldValueFormHtml} from '/admin/tools/explorer/fields/values/fieldValueFormHtml';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


export function newOrEdit({
	path
}) {
	//log.info(toStr({path}));
	const relPath = path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const action = pathParts[1];
	const fieldName = pathParts[2];
	const valueAction = pathParts[3];
	const valueName = pathParts[4];
	//log.info(toStr({action, fieldName, valueAction, valueName}));

	if(valueName) {
		const connection = connect({
			repoId: REPO_ID_EXPLORER,
			branch: BRANCH_ID_EXPLORER,
			principals: [PRINCIPAL_EXPLORER_READ]
		});
		const nodePath = `/fields/${fieldName}/${valueName}`;
		const node = connection.get(nodePath);
		const {displayName} = node;
		return htmlResponse({
			main: fieldValueFormHtml({
				field: fieldName,
				//action: `${TOOL_PATH}/fields/values/${fieldName}/update/${valueName}`,
				displayName,
				value: valueName
			}),
			path
		});
	}

	return htmlResponse({
		main: fieldValueFormHtml({
			field: fieldName
		}),
		path
	});
} // newOrEdit
