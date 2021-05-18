import {QueryFilterClause} from './QueryFilterClause';


export function QueryFiltersBuilder(props) {
	const {
		disabled = false,
		fieldsObj = {},
		parentPath,
		name = 'filters',
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	return <>
		<QueryFilterClause disabled={disabled} fieldsObj={fieldsObj} name='must' id='must' parentPath={path}/>
		<QueryFilterClause disabled={disabled} fieldsObj={fieldsObj} name='mustNot' id='mustnot' parentPath={path}/>
		<QueryFilterClause disabled={disabled} fieldsObj={fieldsObj} name='should' id='should' parentPath={path}/>
	</>;
} // function QueryFiltersBuilder
