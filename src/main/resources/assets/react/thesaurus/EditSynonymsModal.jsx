import {
	Button, Icon, Modal, Popup
} from 'semantic-ui-react';

import {EditSynonyms} from './EditSynonyms';


export function EditSynonymsModal(props) {
	//console.debug('EditSynonymsModal props', props);
	const {
		locales,
		onClose,
		servicesBaseUrl,
		thesaurusId,
		thesaurusName
	} = props;

	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		size='fullscreen'
		trigger={thesaurusId
			? <Button
				icon
				onClick={() => setOpen(true)}
			><Icon color='blue' name='edit'/> Edit synonyms</Button>
			: <Popup
				content='Edit all synonyms'
				inverted
				trigger={<Button
					icon
					onClick={() => setOpen(true)}
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
