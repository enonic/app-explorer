import type {User} from '/lib/xp/auth';
import type {
	SemanticICONS,
} from 'semantic-ui-react';


import {
	Link,
	useLocation,
} from 'react-router-dom';
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
	userState,
}: {
	licensedTo: string
	licenseValid: boolean
	menuIconName: SemanticICONS
	servicesBaseUrl: string
	setLicensedTo: React.Dispatch<React.SetStateAction<string>>
	setLicenseValid: React.Dispatch<React.SetStateAction<boolean>>
	setSideBarVisible: React.Dispatch<React.SetStateAction<boolean>>
	sideBarVisible: boolean
	userState: User
}) {
	const location = useLocation();
	return <Menu
		className="admin-ui-gray"
		inverted
		fixed='top'
	>
		<Menu.Item className="fitMenu" as='a' onClick={() => setSideBarVisible(!sideBarVisible)}>
			<Icon size='large' name={menuIconName}/>
		</Menu.Item>
		<Menu.Item
			as={Link}
			header
			to='/'
			content='Explorer'
		/>
		<UploadLicenseModal
			licenseValid={licenseValid}
			licensedTo={licensedTo}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
		/>
		<Menu.Menu position='right' style={{
			marginRight: 44
		}}>
			<Menu.Item
				active={location.pathname === '/user'}
				as={Link}
				to='/user'
			>
				<Icon name='user'/>
				{userState?.displayName}
			</Menu.Item>
		</Menu.Menu>
	</Menu>;
}
