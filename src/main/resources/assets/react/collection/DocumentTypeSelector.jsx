import getIn from 'get-value';
import {
	Dropdown,
	Header
} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';


const GQL_DOCUMENT_TYPE_QUERY = `{
	queryDocumentTypes {
		hits {
			_id
			_name
		}
	}
}`;


export function DocumentTypeSelector(props) {
	const [context, dispatch] = getEnonicContext();

	const {
		name = 'documentTypeId',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'Please select a document type',
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

	const [documentTypes, setDocumentTypes] = React.useState([]);

	function queryDocumentTypes() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: GQL_DOCUMENT_TYPE_QUERY
			})
		})
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setDocumentTypes(data.data.queryDocumentTypes.hits);
			});
	} // queryDocumentTypes

	React.useEffect(() => {
		queryDocumentTypes();
	}, [collectorName]);

	if(collectorName) return null;

	return <>
		<Header as='h2' dividing content='Document type'/>
		<Dropdown
			fluid
			loading={!documentTypes.length}
			onChange={(ignoredEvent,{value: newValue}) => {
				//console.debug('newValue', newValue);
				dispatch(setValue({
					path,
					value: newValue
				}));
			}}
			options={documentTypes.map(({
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
