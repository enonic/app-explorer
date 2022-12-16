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
	sideBarVisible,
}: {
	licenseValid: boolean
	sideBarVisible: boolean
}) {
	const location = useLocation();
	return <Sidebar
		animation='overlay'
		as={Menu}
		direction='left'
		id='mySidebar'
		vertical
		visible={sideBarVisible}
	>
		<Menu.Item
			as={Link}
			to='/'
			active={location.pathname === '/'}
		><Icon name='search' style={ICON_STYLE}/> Home</Menu.Item>
		{licenseValid && <Menu.Item
			as={Link}
			to='/api'
			active={location.pathname === '/api'}
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
			><Icon name='cogs' style={ICON_STYLE}/> Status</Menu.Item>
			<Menu.Item
				as={Link}
				to='/collections/journal'
				active={location.pathname === '/collections/journal'}
			><Icon name='newspaper' style={ICON_STYLE}/> Journal</Menu.Item>
			<Menu.Item
				as={Link}
				to='/collections/notifications'
				active={location.pathname === '/collections/notifications'}
			><Icon name='warning' style={ICON_STYLE}/> Notifications</Menu.Item>
			<Menu.Item
				as={Link}
				to='/collections/schedule'
				active={location.pathname === '/collections/schedule'}
			><Icon name='calendar' style={ICON_STYLE}/> Schedule</Menu.Item>
		</Menu.Menu>}
		<Menu.Item
			as={Link}
			to='/documents'
			active={location.pathname === '/documents'}
		><Icon name='file' style={ICON_STYLE}/> Documents</Menu.Item>
		<Menu.Item
			as={Link}
			to='/documentTypes'
			active={location.pathname === '/documentTypes'}
		><Icon name='file code' style={ICON_STYLE}/> Document types</Menu.Item>
		<Menu.Item
			as={Link}
			to='/stopWords'
			active={location.pathname === '/stopWords'}
		><Icon name='ban' style={ICON_STYLE}/> StopWords</Menu.Item>
		<Menu.Item
			as={Link}
			to='/synonyms'
			active={location.pathname === '/synonyms'}
		><Icon name='code branch' style={ICON_STYLE}/> Synonyms</Menu.Item>
		<Menu.Item
			as={Link}
			to='/interfaces'
			active={location.pathname === '/interfaces'}
		><Icon name='plug' style={ICON_STYLE}/> Interfaces</Menu.Item>
		<Menu.Item
			as={Link}
			to='/about'
			active={location.pathname === '/about'}
		><Icon name='info' style={ICON_STYLE}/> About</Menu.Item>
	</Sidebar>;
}
