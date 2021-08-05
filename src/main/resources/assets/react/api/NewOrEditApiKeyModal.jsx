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
		initialValues,
		onClose = () => {},
		onOpen = () => {},
		queryCollectionsGraph,
		queryInterfacesGraph,
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	return <Modal
		closeIcon
		onClose={() => {
			setState({open: false});
			onClose();
		}}
		onOpen={onOpen}
		open={state.open}
		size='large'
		trigger={_name ? <Popup
			content={`Edit API Key ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setState({open: true})}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Button
				circular
				color='green'
				icon
				onClick={() => setState({open: true})}
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
				initialValues={initialValues}
				onClose={() => {
					setState({open: false});
					onClose();
				}}
				queryCollectionsGraph={queryCollectionsGraph}
				queryInterfacesGraph={queryInterfacesGraph}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
	</Modal>;
}; // NewOrEditApiKeyModal
