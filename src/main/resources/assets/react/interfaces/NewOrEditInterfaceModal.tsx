import type { DropdownItemProps } from 'semantic-ui-react/index.d';
import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';
import type {
	FieldNameToValueTypes,
	InterfaceNamesObj
} from './index.d';


import * as React from 'react';
import { Button, Modal, Popup } from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import { UploadLicense } from '../components/UploadLicense';
import { NewOrEditInterface } from './NewOrEditInterface';


type NewOrEditInterfaceModalProps = {
	// Required
	collectionOptions: DropdownItemProps[]
	fieldNameToValueTypesState: FieldNameToValueTypes
	interfaceNamesObj: InterfaceNamesObj
	licenseValid: boolean
	servicesBaseUrl: string
	setLicensedTo: SetLicensedToFunction
	setLicenseValid: SetLicenseValidFunction
	stopWordOptions: DropdownItemProps[]
	thesauriOptions: DropdownItemProps[]
	total: number
	// Optional
	_id?: string
	_name?: string
	afterClose?: () => void
	beforeOpen?: () => void
	defaultOpen?: boolean,
	disabled?: boolean
	loading?: boolean
}


export function NewOrEditInterfaceModal(props: NewOrEditInterfaceModalProps) {
	const {
		// Required
		collectionOptions,
		fieldNameToValueTypesState,
		interfaceNamesObj,
		licenseValid,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid,
		stopWordOptions,
		thesauriOptions,
		total,
		// Optional
		_id, // nullable
		_name,
		afterClose = () => {/**/},
		beforeOpen = () => {/**/},
		defaultOpen = false,
		disabled = false,
		loading = false,
	} = props;
	//console.debug('initialValues', initialValues);

	const [open, setOpen] = React.useState(defaultOpen);

	const header = _id ? `Edit interface ${_name}`: 'New interface';

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
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='large'
		trigger={
			<Popup
				content={header}
				inverted
				trigger={
					_id
						? <HoverButton
							color='blue'
							disabled={loading || disabled}
							loading={loading}
							icon='edit'
							onClick={doOpen}
						/>
						: <Button
							circular
							color='green'
							disabled={loading || disabled}
							icon='plus'
							loading={loading}
							onClick={doOpen}
							size='massive'
							style={{
								bottom: 13.5,
								margin: 0,
								position: 'fixed',
								right: 13.5
							}}
						/>
				}
			/>
		}
	>{licenseValid
		|| (!_id && total <= 1) // Allowed to create interface number 2, but not number 3
		|| (_id && total <= 2) // Allowed to edit interface number 2, but not number 3
			? <>
				<Modal.Header>{header}</Modal.Header>
				<NewOrEditInterface
					_id={_id}
					collectionOptions={collectionOptions}
					doClose={doClose}
					fieldNameToValueTypesState={fieldNameToValueTypesState}
					interfaceNamesObj={interfaceNamesObj}
					servicesBaseUrl={servicesBaseUrl}
					stopWordOptions={stopWordOptions}
					thesauriOptions={thesauriOptions}
				/>
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
			/>}
	</Modal>;
} // NewOrEditInterfaceModal
