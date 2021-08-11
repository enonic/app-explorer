import getIn from 'get-value';
import {
	Dropdown,
	Header
} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';


const GQL_SCHEMA_QUERY = `{
	querySchema {
		hits {
			_id
			_name
		}
	}
}`;


export function SchemaSelector(props) {
	const [context, dispatch] = getEnonicContext();

	const {
		name = 'schemaId',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'Please select a schema',
		servicesBaseUrl,
		value = getIn(context.values, path)/*,
		...rest*/
	} = props;
	//console.debug('context.values',context.values);
	//console.debug('value', value);
	const {
		collector: {
			name: collectorName
		}
	} = context.values;
	//console.debug('collectorName',collectorName);

	const [schema, setSchema] = React.useState([]);

	function querySchema() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_SCHEMA_QUERY
			})
		})
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setSchema(data.data.querySchema.hits);
			});
	} // querySchema

	React.useEffect(() => {
		querySchema();
	}, [collectorName]);

	if(collectorName) return null;

	return <>
		<Header as='h2' dividing content='Schema'/>
		<Dropdown
			fluid
			loading={!schema.length}
			onChange={(ignoredEvent,{value: newValue}) => {
				//console.debug('newValue', newValue);
				dispatch(setValue({
					path,
					value: newValue
				}));
			}}
			options={schema.map(({
				_id: value,
				_name: text
			}) => ({
				text,
				value
			}))}
			placeholder={placeholder}
			selection
			value={value}
		/>
	</>;
}
