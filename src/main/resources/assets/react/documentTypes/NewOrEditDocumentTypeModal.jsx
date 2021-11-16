import React from "react";
import { Modal } from "semantic-ui-react";

import { NewOrEditDocumentType } from "./NewOrEditDocumentType";

export function NewOrEditDocumentTypeModal({
	_id = undefined, // optional
	_name = 'New document type', // optional
	collectionsArr = [], // optional
	interfacesArr = [], // optional
	open,
	setModalState,
	onClose = () => {},
	onMount = () => {},
	servicesBaseUrl
}) {

	// const [state, setState] = React.useState({_id, _name});

	// setModalState(state);

	return <>
		<Modal
			closeIcon
			closeOnDimmerClick={false}
			onClose={onClose}
			onMount={onMount}
			open={open}
			size="large"
		>
			<Modal.Header as="h1" className="ui">
				{_name}
			</Modal.Header>
			<NewOrEditDocumentType
				_id={_id}
				collectionsArr={collectionsArr}
				interfacesArr={interfacesArr}
				doClose={onClose}
				servicesBaseUrl={servicesBaseUrl}
				setParentState={setModalState}
			/>
		</Modal>
	</>;
} // NewOrEditDocumentTypeModal
