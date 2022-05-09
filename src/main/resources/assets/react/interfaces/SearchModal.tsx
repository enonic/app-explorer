//import type {Fields} from '/lib/explorer/types/Field.d';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';


import * as React from 'react';
import {Button, Icon, Modal} from 'semantic-ui-react';

import {Search} from '../Search';


export function SearchModal(props :{
	interfaceName :string
	afterClose ?:() => void
	beforeOpen ?:() => void
	//documentTypesAndFields ?:Record<string,Fields>
	fields ?:Array<InterfaceField>
}) {
	const {
		interfaceName,
		afterClose = () => {},
		beforeOpen = () => {},
		//documentTypesAndFields = {},
		fields = []
	} = props;
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
			onClick={doOpen}
			size='tiny'
		><Icon name='search'/>Search</Button>}
	>
		<Modal.Header>Search interface: {interfaceName}</Modal.Header>
		<Modal.Content>
			<Search
				fields={fields}
				interfaceName={interfaceName}
			/>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose} primary>Close</Button>
		</Modal.Actions>
	</Modal>;
} // SearchModal
