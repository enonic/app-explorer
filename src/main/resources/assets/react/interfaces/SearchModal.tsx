//import type {Fields} from '@enonic-types/lib-explorer/Field.d';
import type {InterfaceField} from '@enonic-types/lib-explorer/Interface.d';


import * as React from 'react';
import {
	Button,
	Modal,
	Popup,
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import {Search} from './search/Search';


export function SearchModal({
	// Required
	basename,
	interfaceName,
	searchString = '', setSearchString,
	servicesBaseUrl,
	setInterfaceNameState,
	// Optional
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	//documentTypesAndFields = {},
	fields = [],
	loading = false
} :{
	// Required
	basename: string
	interfaceName: string
	searchString?: string
	setSearchString: React.Dispatch<React.SetStateAction<string>>
	servicesBaseUrl: string
	setInterfaceNameState: React.Dispatch<React.SetStateAction<string>>
	// Optional
	afterClose ?:() => void
	beforeOpen ?:() => void
	//documentTypesAndFields ?:Record<string,Fields>
	fields ?:Array<InterfaceField>
	loading ?:boolean
}) {
	//console.debug('documentTypesAndFields', documentTypesAndFields);

	const [open, setOpen] = React.useState(false);

	const doClose = () => {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='fullscreen'
		trigger={
			<Popup
				content={`Try searching interface ${interfaceName}`}
				inverted
				trigger={
					<HoverButton
						disabled={loading}
						icon='search'
						loading={loading}
						onClick={doOpen}
					/>
				}
			/>
		}
	>
		<Modal.Header>Search interface: {interfaceName}</Modal.Header>
		<Modal.Content>
			<Search
				basename={basename}
				firstColumnWidth={3}
				fields={fields}
				interfaceNameState={interfaceName}
				searchString={searchString} setSearchString={setSearchString}
				servicesBaseUrl={servicesBaseUrl}
				setInterfaceNameState={setInterfaceNameState}
			/>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose} primary>Close</Button>
		</Modal.Actions>
	</Modal>;
} // SearchModal
