import {getIn} from '@enonic/js-utils';
import * as React from 'react';
import {
	Dropdown,
	Header
} from 'semantic-ui-react';

//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';
//@ts-ignore
import {setValue} from 'semantic-ui-react-form/actions';


const GQL_DOCUMENT_TYPE_QUERY = `{
	queryDocumentTypes {
		hits {
			_id
			_name
		}
	}
}`;


export function DocumentTypeSelector(props :{
	servicesBaseUrl :string

	name ?:string
	parentPath ?:string
	path ?:string
	placeholder ?:string
	value ?:string
}) {
	const [context, dispatch] = getEnonicContext();

	const {
		servicesBaseUrl,
		name = 'documentTypeId',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'Please select a document type (or leave empty and a new one will automatically be created).',
		value = getIn(context.values, path)/*,
		...rest*/
	} = props;
	//console.debug('context.values',context.values);
	//console.debug('value', value);
	const {
		collector: {
			name: collectorName = null
		} = {}
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
			clearable={true}
			fluid
			loading={!documentTypes.length}
			onChange={(
				//@ts-ignore
				ignoredEvent,
				{value: newValue}
			) => {
				//console.debug('newValue', newValue);
				dispatch(setValue({
					path,
					value: newValue
				}));
			}}
			options={[{
				text: 'Automatically create a new one',
				value: '_new'
			}].concat(documentTypes.map(({
				_id: value,
				_name: text
			}) => ({
				text,
				value
			})))}
			placeholder={placeholder}
			selection
			value={value}
		/>
	</>;
}
