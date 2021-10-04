import {Button, Icon, Modal} from 'semantic-ui-react';

import {Search} from '../Search';


export function SearchModal(props) {
	const {
		afterClose = () => {},
		beforeOpen = () => {},
		interfaceName,
		servicesBaseUrl
	} = props;
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
				interfaceName={interfaceName}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
	</Modal>;
} // SearchModal
