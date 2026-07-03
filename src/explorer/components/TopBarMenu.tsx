import type {
	SemanticICONS,
	StrictDropdownItemProps,
} from 'semantic-ui-react';


import {
	useEffect,
	useRef,
} from 'react';
import {
	Link,
	useLocation,
	useNavigate,
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
}) {
	const location = useLocation();
	const navigate = useNavigate();

	const xpMenuContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const container = xpMenuContainerRef.current;
		if (!container) { return; }

		let shadowObserver: MutationObserver;

		const linkUpUsername = (xpMenu: Element) => {
			const shadowRoot = xpMenu.shadowRoot;
			if (!shadowRoot) { return; }
			const addLink = () => {
				const usernameEl = shadowRoot.querySelector<HTMLElement>('.avatar-dropdown-username');
				if (!usernameEl) { return false; }
				if (!usernameEl.dataset.explorerUserLink) {
					usernameEl.dataset.explorerUserLink = 'true';
					usernameEl.style.cursor = 'pointer';
					usernameEl.addEventListener('click', () => navigate('/user'));
				}
				return true;
			};
			if (addLink()) { return; }
			shadowObserver = new MutationObserver(() => {
				if (addLink()) {
					shadowObserver.disconnect();
				}
			});
			shadowObserver.observe(shadowRoot, { childList: true, subtree: true });
		};

		const moveXpMenu = () => {
			const xpMenu = document.querySelector('xp-menu');
			if (!xpMenu) { return false; }
			if (xpMenu.parentElement !== container) {
				container.appendChild(xpMenu);
			}
			linkUpUsername(xpMenu);
			return true;
		};

		let bodyObserver: MutationObserver;
		if (!moveXpMenu()) {
			bodyObserver = new MutationObserver(() => {
				if (moveXpMenu()) {
					bodyObserver.disconnect();
				}
			});
			bodyObserver.observe(document.body, { childList: true });
		}
		return () => {
			bodyObserver?.disconnect();
			shadowObserver?.disconnect();
		};
	}, [navigate]);

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
			marginRight: 100
		}}>
			<div
				ref={xpMenuContainerRef}
				style={{
					alignItems: 'center',
					display: 'flex',
				}}
			/>
		</Menu.Menu>
		{location.pathname === '/api' && interfaceOptions.length
			? <Dropdown
				className={[
					'p-f',
					't-3',
					'l-50p',
					'tf-tx--50p'
				].join(' ')}
				onChange={(_event,{value}) => {
					if (!value) { value = 'default'; }
					setInterfaceNameState(value as string);
				}}
				options={interfaceOptions}
				placeholder='Please select an interface'
				search
				selection
				style={{
					maxWidth: 'calc(100vw - 61px - 44px)',
					width: 768 - 61 - 44,
				}}
				value={interfaceNameState === 'default'? undefined : interfaceNameState}
			/>
			: null
		}

	</Menu>;
}
