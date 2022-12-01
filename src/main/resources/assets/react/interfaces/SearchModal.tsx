//import type {Fields} from '/lib/explorer/types/Field.d';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';


import * as React from 'react';
import {Button, Icon, Modal} from 'semantic-ui-react';

import {Search} from '../search/Search';


export function SearchModal({
	// Required
	interfaceName,
	servicesBaseUrl,
	// Optional
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	//documentTypesAndFields = {},
	fields = [],
	loading = false
} :{
	// Required
	interfaceName: string
	servicesBaseUrl: string
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
		size='large'
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
				firstColumnWidth={3}
				fields={fields}
				interfaceName={interfaceName}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose} primary>Close</Button>
		</Modal.Actions>
	</Modal>;
} // SearchModal
