import {Button, Icon, Modal, Popup} from 'semantic-ui-react';

import {NewOrEditInterface} from './NewOrEditInterface';
import {UploadLicense} from '../UploadLicense';


export function NewOrEditInterfaceModal(props) {
	const {
		afterClose = () => {},
		beforeOpen = () => {},
		collectionOptions,
		disabled = false,
		displayName,
		fieldsObj,
		id, // nullable
		//initialValues = {},
		licenseValid,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid,
		stopWordOptions,
		thesauriOptions,
		total
	} = props;
	//console.debug('initialValues', initialValues);

	const [open, setOpen] = React.useState(false);

	const header = id ? `Edit interface ${displayName}`: 'New interface';

	const doClose = () => {
		setOpen(false);
		afterClose();
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
		size='large'
		trigger={<Popup
			content={header}
			inverted
			trigger={id ? <Button
				disabled={disabled}
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>
				: <Button
					circular
					color='green'
					disabled={disabled}
					icon
					onClick={doOpen}
					size='massive'
					style={{
						bottom: 13.5,
						position: 'fixed',
						right: 13.5
					}}><Icon
						name='plus'
					/></Button>}/>}
	>{licenseValid || total <= 1 // This means it will be allowed to create interface number 2, but not number 3
			? <>
				<Modal.Header>{header}</Modal.Header>
				<Modal.Content>
					<NewOrEditInterface
						collectionOptions={collectionOptions}
						fieldsObj={fieldsObj}
						id={id}
						doClose={doClose}
						servicesBaseUrl={servicesBaseUrl}
						stopWordOptions={stopWordOptions}
						thesauriOptions={thesauriOptions}
					/>
				</Modal.Content>
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
			/>}
	</Modal>;
} // NewOrEditInterfaceModal
