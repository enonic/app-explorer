import {Button, Icon, Modal} from 'semantic-ui-react';

import {Search} from '../Search';


export function SearchModal(props) {
	const {
		interfaceName,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={() => setOpen(false)}
		open={open}
		size='large'
		trigger={<Button
			compact
			onClick={() => setOpen(true)}
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
