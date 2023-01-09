import type {StrictDropdownProps} from 'semantic-ui-react';
import {DropdownItemsWithKeys} from './index.d';


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
	placeholder = 'Please select a document type',
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

	// Even though DropdownItemProps

	const documentTypeOptions :DropdownItemsWithKeys<string> = [{
		key: '_none',
		text: 'none',
		value: '_none'
	},{
		key: '_new',
		text: 'automatically create a new one',
		value: '_new'
	}].concat(documentTypes.map(({
		_id: key,
		_name: text
	}) => ({
		key,
		text,
		value: key
	})));
	//console.debug('DocumentTypeSelector documentTypeOptions', documentTypeOptions);

	return <>
		<Header as='h3' dividing content='Default document type'/>
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
			options={documentTypeOptions}
			value={documentTypeId}
		/>
	</>;
}
