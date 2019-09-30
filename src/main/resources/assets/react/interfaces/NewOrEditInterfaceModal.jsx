import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';
import generateUuidv4 from 'uuid/v4';

import {NewOrEditInterface} from './NewOrEditInterface';


export function NewOrEditInterfaceModal(props) {
	const {
		afterClose = () => {/*no-op*/},
		collectionOptions,
		disabled = false,
		displayName,
		fieldsObj,
		id, // nullable
		//initialValues = {},
		servicesBaseUrl,
		stopWordOptions,
		thesauriOptions
	} = props;
	//console.debug('initialValues', initialValues);

	const [open, setOpen] = React.useState(false);

	const header = id ? `Edit interface ${displayName}`: 'New interface';

	return <Modal
		closeIcon
		onClose={() => {
			setOpen(false);
			afterClose();
		}}
		open={open}
		size='large'
		trigger={<Popup
			content={header}
			inverted
			trigger={id ? <Button
				disabled={disabled}
				icon
				onClick={() => setOpen(true)}
			><Icon color='blue' name='edit'/></Button>
				: <Button
					circular
					color='green'
					disabled={disabled}
					icon
					onClick={() => setOpen(true)}
					size='massive'
					style={{
						bottom: 13.5,
						position: 'fixed',
						right: 13.5
					}}><Icon
						name='plus'
					/></Button>}/>}
	>
		<Modal.Header>{header}</Modal.Header>
		<Modal.Content>
			<NewOrEditInterface
				collectionOptions={collectionOptions}
				fieldsObj={fieldsObj}
				id={id}
				servicesBaseUrl={servicesBaseUrl}
				stopWordOptions={stopWordOptions}
				thesauriOptions={thesauriOptions}
			/>
		</Modal.Content>
	</Modal>;
} // NewOrEditInterfaceModal
