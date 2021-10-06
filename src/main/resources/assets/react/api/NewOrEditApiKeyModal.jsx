import {
	Button,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';

import {NewOrEditApiKey} from './NewOrEditApiKey';


export const NewOrEditApiKeyModal = (props) => {
	//console.debug('props', props);
	const {
		_name,
		afterClose = () => {},
		beforeOpen = () => {},
		initialValues,
		queryCollectionsGraph,
		queryInterfacesGraph,
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});

	const doClose = () => {
		setState({open: false});
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setState({open: true});
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={state.open}
		size='large'
		trigger={_name ? <Popup
			content={`Edit API Key ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Button
				circular
				color='green'
				icon
				onClick={doOpen}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{_name ? `Edit API Key ${_name}`: 'New API Key'}</Modal.Header>
		<Modal.Content>
			<NewOrEditApiKey
				_name={_name}
				doClose={doClose}
				initialValues={initialValues}
				queryCollectionsGraph={queryCollectionsGraph}
				queryInterfacesGraph={queryInterfacesGraph}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
	</Modal>;
}; // NewOrEditApiKeyModal
