import type {QueryApiKeysHits} from './index.d';


import * as React from 'react';
import {
	Button,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';

import {NewOrEditApiKey} from './NewOrEditApiKey';


export const NewOrEditApiKeyModal = (props :{
	// Required
	apiKeys: QueryApiKeysHits
	servicesBaseUrl :string
	// Optional
	_id ?:string
	_name ?:string
	afterClose ?:() => void
	beforeOpen ?:() => void
	collections ?:Array<string>
	disabled ?:boolean
	loading ?:boolean
	interfaces ?:Array<string>
}) => {
	//console.debug('props', props);
	const {
		// Required
		apiKeys,
		servicesBaseUrl,
		// Optional
		_id,
		_name,
		afterClose = () => {/**/},
		beforeOpen = () => {/**/},
		collections = [],
		disabled = false,
		loading = false,
		interfaces = []
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
		size='small'
		trigger={
			_name
				? <Popup
					content={`Edit API Key ${_name}`}
					inverted
					trigger={
						<HoverButton
							color='blue'
							disabled={disabled}
							loading={loading}
							icon='edit'
							onClick={doOpen}
						/>
					}
				/>
				: <Button
					circular
					color='green'
					disabled={disabled}
					icon
					loading={loading}
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
		<NewOrEditApiKey
			_id={_id}
			_name={_name}
			apiKeys={apiKeys}
			doClose={doClose}
			collections={collections}
			interfaces={interfaces}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</Modal>;
}; // NewOrEditApiKeyModal
