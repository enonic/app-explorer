import * as React from 'react';
import {
	Link,
	useLocation,
} from 'react-router-dom';
import {
	Icon,
	Menu,
	Sidebar,
} from 'semantic-ui-react';
import Ref from '@semantic-ui-react/component-ref';
import {
	ICON_STYLE,
	// PUSHER_WIDTH
} from '../constants';


function getDescendants(element: Element) {
	const descendants = [];
	Array.from(element.children).forEach(child => {
		descendants.push(child);
		if (child.children.length) {
			getDescendants(child).forEach(grandChild => descendants.push(grandChild))
		}
	});
	return descendants;
}


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
	const sidebarRef = React.useRef();
	return <Ref innerRef={sidebarRef}>
		<Sidebar
			animation='overlay'
			as={Menu}
			direction='left'
			id='mySidebar'
			onBlur={(event) => {
				const descendants = getDescendants(sidebarRef.current)
				if (!descendants.includes(event.relatedTarget)) {
					// console.debug('Element outside sidebar got focus', event.relatedTarget);
					setSideBarVisible(false);
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
			<Menu.Item
				active={location.pathname === '/collections'}
				as={Link}
				to='/collections'
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
				><Icon name='mail' style={ICON_STYLE}/> Notifications</Menu.Item>
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
				active={location.pathname === '/api'}
				as={Link}
				onClick={() => {
					if (!licenseValid) {
						setSideBarVisible(false);
					}
				}}
				to='/api'
			><Icon name='plug' style={ICON_STYLE}/> API</Menu.Item>
			{[
				'/api',
				'/api/keys',
			].includes(location.pathname) && <Menu.Menu>
				{licenseValid && <Menu.Item
					as={Link}
					to='/api/keys'
					active={location.pathname === '/api/keys'}
					onClick={() => {
						setSideBarVisible(false);
					}}
				><Icon name='key' style={ICON_STYLE}/> Keys</Menu.Item>}
			</Menu.Menu>}
			<Menu.Item
				as={Link}
				to='/about'
				active={location.pathname === '/about'}
				onClick={() => {
					setSideBarVisible(false);
				}}
			><Icon name='info' style={ICON_STYLE}/> About</Menu.Item>
		</Sidebar>
	</Ref>;
}
