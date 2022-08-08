import type {Locales} from '../../index.d';


import * as React from 'react';
import {Button, Modal} from 'semantic-ui-react';
import {EditSynonyms} from './EditSynonyms';


export type EditSynonymsModalState = {
	_id ?:string
	_name ?:string
	open :boolean
}


export function EditSynonymsModal({
	// Required
	locales,
	open,
	servicesBaseUrl,
	setEditSynonymsModalState,
	// Optional
	afterClose = () => {/**/},
	thesaurusId,
	thesaurusName
} :{
	// Required
	locales :Locales
	open :boolean
	servicesBaseUrl :string
	setEditSynonymsModalState :React.Dispatch<React.SetStateAction<EditSynonymsModalState>>
	// Optional
	afterClose ?:() => void
	thesaurusId ?:string
	thesaurusName ?:string
}) {
	const doClose = () => {
		setEditSynonymsModalState({
			_id: undefined,
			_name: undefined,
			open: false
		});
		afterClose(); // This could trigger render in parent, and unmount this Component.
	};

	const header = `Edit ${thesaurusName || 'all'} synonyms`;

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='fullscreen'
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
