//import type {Fields} from '/lib/explorer/types/Field.d';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';


import * as React from 'react';
import {Button, Icon, Modal} from 'semantic-ui-react';

import {Search} from './search/Search';


export function SearchModal({
	// Required
	basename,
	interfaceName,
	servicesBaseUrl,
	setBottomBarMessage,
	setBottomBarMessageHeader,
	setBottomBarVisible,
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
	servicesBaseUrl: string
	setBottomBarMessage: React.Dispatch<React.SetStateAction<string>>
	setBottomBarMessageHeader: React.Dispatch<React.SetStateAction<string>>
	setBottomBarVisible: React.Dispatch<React.SetStateAction<boolean>>
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
		trigger={<Button
			compact
			disabled={loading}
			loading={loading}
			onClick={doOpen}
			size='tiny'
		><Icon name='search'/>Search</Button>}
	>
		<Modal.Header>Search interface: {interfaceName}</Modal.Header>
		<Modal.Content>
			<Search
				basename={basename}
				firstColumnWidth={3}
				fields={fields}
				interfaceName={interfaceName}
				servicesBaseUrl={servicesBaseUrl}
				setBottomBarMessage={setBottomBarMessage}
				setBottomBarMessageHeader={setBottomBarMessageHeader}
				setBottomBarVisible={setBottomBarVisible}
			/>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose} primary>Close</Button>
		</Modal.Actions>
	</Modal>;
} // SearchModal
