import {QueryFilterClause} from './QueryFilterClause';


export function QueryFiltersBuilder(props) {
	const {
		fieldsObj = {},
		parentPath,
		name = 'filters',
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	return <>
		<QueryFilterClause fieldsObj={fieldsObj} name='must' id='must' parentPath={path}/>
		{/*<QueryFilterClause fieldsObj={fieldsObj} name='mustNot' id='mustnot' parentPath={path}/>*/}
	</>
} // function QueryFiltersBuilder
