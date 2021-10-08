import {
	Button, Icon, Modal, Popup
} from 'semantic-ui-react';

import {EditSynonyms} from './EditSynonyms';


export function EditSynonymsModal(props) {
	//console.debug('EditSynonymsModal props', props);
	const {
		afterClose = () => {},
		beforeOpen = () => {},
		locales,
		servicesBaseUrl,
		thesaurusId,
		thesaurusName
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

	const header = `Edit ${thesaurusName || 'all'} synonyms`;

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='fullscreen'
		trigger={<Popup
			content={header}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='code branch'/></Button>}
		/>}
	>
		<Modal.Header>{header}</Modal.Header>
		<Modal.Content>
			<EditSynonyms
				locales={locales}
				servicesBaseUrl={servicesBaseUrl}
				thesaurusId={thesaurusId}
				thesaurusName={thesaurusName}
			/>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose} primary>Close</Button>
		</Modal.Actions>
	</Modal>;
} // EditSynonymsModal
