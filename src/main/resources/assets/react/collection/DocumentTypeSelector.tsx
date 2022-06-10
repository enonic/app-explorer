import type {
	DropdownItemProps,
	StrictDropdownProps
} from 'semantic-ui-react';
import type {CollectionFormValues} from '/lib/explorer/types/index.d';


import {getIn} from '@enonic/js-utils';
import * as React from 'react';
import {
	Dropdown,
	Header
} from 'semantic-ui-react';


const GQL_DOCUMENT_TYPE_QUERY = `{
	queryDocumentTypes {
		hits {
			_id
			_name
		}
	}
}`;


export function DocumentTypeSelector({
	documentTypeId,
	servicesBaseUrl,
	setDocumentTypeId,
	placeholder = 'Please select a document type (or leave empty and a new one will automatically be created).',
	...rest
} :Omit<StrictDropdownProps,'loading'|'onChange'|'options'|'value'> & {
	documentTypeId :string
	servicesBaseUrl :string
	setDocumentTypeId :(documentTypeId :string) => void
}) {
	const [loading, setLoading] = React.useState(false);
	const [documentTypes, setDocumentTypes] = React.useState([]);

	const memoizedQueryDocumentTypes = React.useCallback(() => {
		setLoading(true);
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
				setLoading(false);
			});
	}, [
		servicesBaseUrl
	])

	React.useEffect(() => {
		memoizedQueryDocumentTypes();
	},[
		memoizedQueryDocumentTypes
	]);

	return <>
		<Header as='h2' dividing content='Document type'/>
		<Dropdown
			clearable={true}
			fluid
			placeholder={placeholder}
			selection
			{...rest}
			loading={loading}
			onChange={(
				_event,
				{value: newDocumentTypeId}
			) => {
				setDocumentTypeId(newDocumentTypeId as string);
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
			value={documentTypeId}
		/>
	</>;
}
