import type {
	SemanticICONS,
} from 'semantic-ui-react';


import {
	Icon,
	Menu,
} from 'semantic-ui-react';
import {UploadLicenseModal} from './UploadLicenseModal';

export default function TopBarMenu({
	licensedTo,
	licenseValid,
	menuIconName,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid,
	sideBarVisible, setSideBarVisible,
}: {
	licensedTo: string
	licenseValid: boolean
	menuIconName: SemanticICONS
	servicesBaseUrl: string
	setLicensedTo: React.Dispatch<React.SetStateAction<string>>
	setLicenseValid: React.Dispatch<React.SetStateAction<boolean>>
	setSideBarVisible: React.Dispatch<React.SetStateAction<boolean>>
	sideBarVisible: boolean
}) {
	return <Menu
		className="admin-ui-gray"
		inverted
		fixed='top'
	>
		<Menu.Item className="fitMenu" as='a' onClick={() => setSideBarVisible(!sideBarVisible)}>
			<Icon size='large' name={menuIconName}/>
		</Menu.Item>
		<Menu.Item header>Explorer</Menu.Item>
		<UploadLicenseModal
			licenseValid={licenseValid}
			licensedTo={licensedTo}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
		/>
	</Menu>;
}
