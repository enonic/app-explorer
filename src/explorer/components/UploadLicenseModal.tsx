import * as React from 'react';
import {Menu, Modal} from 'semantic-ui-react';
import {UploadLicense} from './UploadLicense';


export const UploadLicenseModal = ({
	licenseValid,
	licensedTo,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid
}: {
	licensedTo :string
	licenseValid :boolean
	servicesBaseUrl :string
	setLicensedTo :React.Dispatch<React.SetStateAction<string>>
	setLicenseValid :React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={() => {setOpen(false);}}
		open={open}
		size='large'
		trigger={<Menu.Item
			style={{pointerEvents: licenseValid ? 'none' : null}}
			onClick={() => {!licenseValid && setOpen(true);}}>{licensedTo}
		</Menu.Item>}
	>
		<UploadLicense
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			whenValid={() => {setOpen(false);}}
		/>
	</Modal>;
}; // UploadLicenseModal
