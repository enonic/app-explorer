import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';

import {NewOrEditInterface} from './NewOrEditInterface';
import {UploadLicense} from '../UploadLicense';


export function NewOrEditInterfaceModal(props) {
	const {
		afterClose = () => {/*no-op*/},
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

	const onClose = () => {
		setOpen(false);
		afterClose();
	}

	return <Modal
		closeIcon
		onClose={onClose}
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
	>{licenseValid || total <= 1 // This means it will be allowed to create interface number 2, but not number 3
			? <>
				<Modal.Header>{header}</Modal.Header>
				<Modal.Content>
					<NewOrEditInterface
						collectionOptions={collectionOptions}
						fieldsObj={fieldsObj}
						id={id}
						onClose={onClose}
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
