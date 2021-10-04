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

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		size='fullscreen'
		trigger={thesaurusId
			? <Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/> Edit synonyms</Button>
			: <Popup
				content='Edit all synonyms'
				inverted
				trigger={<Button
					icon
					onClick={doOpen}
				><Icon color='blue' name='edit'/></Button>}
			/>
		}>
		<Modal.Header>{thesaurusId ? 'Edit synonyms' : 'Edit all synonyms'}</Modal.Header>
		<Modal.Content>
			<EditSynonyms
				locales={locales}
				servicesBaseUrl={servicesBaseUrl}
				thesaurusId={thesaurusId}
				thesaurusName={thesaurusName}
			/>
		</Modal.Content>
	</Modal>;
} // EditSynonymsModal
