import type {User} from '/lib/xp/auth';
import type {
	SemanticICONS,
	StrictDropdownItemProps,
} from 'semantic-ui-react';


import {
	Link,
	useLocation,
} from 'react-router-dom';
import {
	Dropdown,
	Icon,
	Menu,
} from 'semantic-ui-react';
import {UploadLicenseModal} from './UploadLicenseModal';


export default function TopBarMenu({
	licensedTo,
	licenseValid,
	menuIconName,
	interfaceNameState, setInterfaceNameState,
	interfaceOptions = [],
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid,
	sideBarVisible, setSideBarVisible,
	userState,
}: {
	interfaceNameState: string
	interfaceOptions?: StrictDropdownItemProps[]
	licensedTo: string
	licenseValid: boolean
	menuIconName: SemanticICONS
	servicesBaseUrl: string
	setInterfaceNameState: React.Dispatch<React.SetStateAction<string>>
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
		<Menu.Item className="fitMenu" as={Link} onClick={() => setSideBarVisible(!sideBarVisible)}>
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
		{location.pathname === '/api'
			? <Dropdown
				className={[
					'p-f',
					't-3',
					'l-50p',
					'tf-tx--50p'
				].join(' ')}
				clearable
				onChange={(_event,{value}) => {
					if (!value) { value = 'default'; }
					setInterfaceNameState(value as string);
				}}
				options={interfaceOptions}
				placeholder='Default interface (all collections)'
				search
				selection
				value={interfaceNameState === 'default' ? undefined : interfaceNameState}
			/>
			: null
		}

	</Menu>;
}
