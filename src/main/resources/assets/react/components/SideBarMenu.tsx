import {
	Link,
	useLocation,
} from 'react-router-dom';
import {
	Icon,
	Menu,
	Sidebar,
} from 'semantic-ui-react';
import {
	ICON_STYLE,
	// PUSHER_WIDTH
} from '../constants';


export default function SideBarMenu({
	licenseValid,
	setSideBarVisible,
	sideBarVisible,
}: {
	licenseValid: boolean
	setSideBarVisible: React.Dispatch<React.SetStateAction<boolean>>
	sideBarVisible: boolean
}) {
	const location = useLocation();
	return <Sidebar
		animation='overlay'
		as={Menu}
		direction='left'
		id='mySidebar'
		onBlur={() => {
			// console.debug('mySidebar onBlur');
			if (location.pathname === '/collections') {
				setSideBarVisible(false); // Two clicks in the sidebar triggers this :(
			}
		}}
		vertical
		visible={sideBarVisible}
	>
		<Menu.Item
			as={Link}
			to='/'
			active={location.pathname === '/'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='search' style={ICON_STYLE}/> Home</Menu.Item>
		{licenseValid && <Menu.Item
			as={Link}
			to='/api'
			active={location.pathname === '/api'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='plug' style={ICON_STYLE}/> API</Menu.Item>}
		<Menu.Item
			as={Link}
			to='/collections'
			active={location.pathname === '/collections'}
		><Icon name='database' style={ICON_STYLE}/> Collections</Menu.Item>
		{[
			'/collections',
			'/collections/status',
			'/collections/journal',
			'/collections/notifications',
			'/collections/schedule'
		].includes(location.pathname) &&
		<Menu.Menu>
			<Menu.Item
				as={Link}
				to='/collections/status'
				active={location.pathname === '/collections/status'}
				onClick={() => {
					setSideBarVisible(false);
				}}
			><Icon name='cogs' style={ICON_STYLE}/> Status</Menu.Item>
			<Menu.Item
				as={Link}
				to='/collections/journal'
				active={location.pathname === '/collections/journal'}
				onClick={() => {
					setSideBarVisible(false);
				}}
			><Icon name='newspaper' style={ICON_STYLE}/> Journal</Menu.Item>
			<Menu.Item
				as={Link}
				to='/collections/notifications'
				active={location.pathname === '/collections/notifications'}
				onClick={() => {
					setSideBarVisible(false);
				}}
			><Icon name='warning' style={ICON_STYLE}/> Notifications</Menu.Item>
			<Menu.Item
				as={Link}
				to='/collections/schedule'
				active={location.pathname === '/collections/schedule'}
				onClick={() => {
					setSideBarVisible(false);
				}}
			><Icon name='calendar' style={ICON_STYLE}/> Schedule</Menu.Item>
		</Menu.Menu>}
		<Menu.Item
			as={Link}
			to='/documents'
			active={location.pathname === '/documents'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='file' style={ICON_STYLE}/> Documents</Menu.Item>
		<Menu.Item
			as={Link}
			to='/documentTypes'
			active={location.pathname === '/documentTypes'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='file code' style={ICON_STYLE}/> Document types</Menu.Item>
		<Menu.Item
			as={Link}
			to='/stopWords'
			active={location.pathname === '/stopWords'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='ban' style={ICON_STYLE}/> StopWords</Menu.Item>
		<Menu.Item
			as={Link}
			to='/synonyms'
			active={location.pathname === '/synonyms'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='code branch' style={ICON_STYLE}/> Synonyms</Menu.Item>
		<Menu.Item
			as={Link}
			to='/interfaces'
			active={location.pathname === '/interfaces'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='plug' style={ICON_STYLE}/> Interfaces</Menu.Item>
		<Menu.Item
			as={Link}
			to='/about'
			active={location.pathname === '/about'}
			onClick={() => {
				setSideBarVisible(false);
			}}
		><Icon name='info' style={ICON_STYLE}/> About</Menu.Item>
	</Sidebar>;
}
