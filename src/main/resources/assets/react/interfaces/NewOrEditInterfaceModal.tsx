import type {
	InterfaceNamesObj,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from './index.d';
import type {SemanticUi} from '../../../types/SemanticUi.d';


import * as React from 'react';
import {Button, Icon, Modal, Popup} from 'semantic-ui-react';

import {NewOrEditInterface} from './NewOrEditInterface';
import {UploadLicense} from '../UploadLicense';


type NewOrEditInterfaceModalProps = {
	_id? :string
	_name? :string
	afterClose :() => void
	beforeOpen? :() => void
	collectionIdToFieldKeys :{}
	collectionOptions :Array<SemanticUi.Dropdown.Option>
	disabled? :boolean
	globalFieldsObj :Record<string, boolean>
	interfaceNamesObj :InterfaceNamesObj
	licenseValid :boolean
	servicesBaseUrl :string
	setLicensedTo :SetLicensedToFunction
	setLicenseValid :SetLicenseValidFunction
	stopWordOptions :Array<SemanticUi.Dropdown.Option>
	thesauriOptions :Array<SemanticUi.Dropdown.Option>
	total :number
}


export function NewOrEditInterfaceModal(props :NewOrEditInterfaceModalProps) {
	const {
		_id, // nullable
		_name,
		afterClose = () => {},
		beforeOpen = () => {},
		collectionIdToFieldKeys = {},
		collectionOptions = [],
		disabled = false,
		globalFieldsObj = {
			'_allText': true // TODO: Hardcode
		},
		//initialValues = {},
		interfaceNamesObj = {},
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
		size='small'
		trigger={<Popup
			content={header}
			inverted
			trigger={_id ? <Button
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
				<NewOrEditInterface
					_id={_id}
					collectionIdToFieldKeys={collectionIdToFieldKeys}
					collectionOptions={collectionOptions}
					doClose={doClose}
					globalFieldsObj={globalFieldsObj}
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
