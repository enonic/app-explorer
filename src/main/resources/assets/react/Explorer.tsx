import type {
	CollectorComponents,
	License
} from './index.d';


import {Header, Grid, Icon, List, Menu, Sidebar} from 'semantic-ui-react';
import {ApiKeys} from './api/ApiKeys';
import {Collections} from './collection/Collections';
//import {Fields} from './fields/Fields';
import {Interfaces} from './interfaces/Interfaces';
import {Journals} from './journal/Journals';
import {Notifications} from './notifications/Notifications';
import {Schedule} from './schedule/Schedule';
import {DocumentTypes} from './documentTypes/DocumentTypes';
import {Search} from './search/Search';
import {Status} from './Status';
import {StopWords} from './stopWords/StopWords';
import {Thesauri} from './thesaurus/Thesauri';
import {UploadLicenseModal} from './components/UploadLicenseModal';
import {useExplorerState} from './useExplorerState';
import {
	ICON_STYLE,
	LICENSE_BSD_2_CLAUSE,
	LICENSE_BSD_3_CLAUSE,
	LICENSE_MIT,
	LICENSE_TEXT_BSD_2_CLAUSE,
	LICENSE_TEXT_BSD_3_CLAUSE,
	LICENSE_TEXT_MIT,
	NODE_MODULES,
	PUSHER_WIDTH
} from './constants';


export function Explorer({
	collectorComponents,
	licensedTo: initialLicensedTo,
	licenseValid: initialLicenseValid,
	servicesBaseUrl//,
	//wsBaseUrl
} :{
	collectorComponents :CollectorComponents
	licensedTo :string
	licenseValid :boolean
	servicesBaseUrl :string
}) {
	const {
		defaultInterfaceFields,
		licensedTo,
		licenseValid,
		page,
		pusherWidth,
		menuIconName,
		setLicensedTo,
		setLicenseValid,
		setPage,
		setPusherWidth,
		setSideBarVisible,
		setShowWhichLicense,
		showWhichLicense,
		sideBarVisible
	} = useExplorerState({
		initialLicensedTo,
		initialLicenseValid,
		servicesBaseUrl
	});
	return <>
		<Menu
			className="admin-ui-gray"
			inverted
			fixed='top'
			style={{zIndex: 103}}>
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
		</Menu>
		<Sidebar.Pushable
			id='explorerPushable'>
			<Sidebar
				as={Menu}
				id='mySidebar'
				// inverted
				onHide={() => {
					// NOTE This is called when a Modal dialog is opened/mounted AND ALSO when the Modal dialog is closed.
					//console.debug('Sidebar onHide');
					/* avoid race conditions between browser and react state */
					//setPusherStyle(PUSHER_STYLE_SIDEBAR_HIDE);
				}}
				onHidden={() => {
					//console.debug('Sidebar onHidden');
					/* avoid race conditions between browser and react state */
					setPusherWidth('auto'); // NOTE #394 This has to be here, and NOT under onHide, to avoid viewport wider than screen and invisible fixed buttons...
				}}
				onShow={() => {
					//console.debug('Sidebar onShow');
					/* avoid race conditions between browser and react state */
					setPusherWidth(PUSHER_WIDTH);
					//setPusherStyle(PUSHER_STYLE_SIDEBAR_SHOW);
				}}
				onVisible={() => {
					//console.debug('Sidebar onVisible');
					/* avoid race conditions between browser and react state */
				}}
				style={{
					paddingTop: 40//,
					//width: SIDEBAR_WIDTH_PX
				}}
				vertical
				visible={sideBarVisible}
			>
				<Menu.Item
					as='a'
					href='#home'
					active={page === 'home'}
					onClick={() => setPage('home')}
				><Icon name='search' style={ICON_STYLE}/> Home</Menu.Item>

				{licenseValid && <Menu.Item
					as='a'
					href='#api'
					active={page === 'api'}
					onClick={() => setPage('api')}
				><Icon name='plug' style={ICON_STYLE}/> API</Menu.Item>}
				<Menu.Item
					as='a'
					href='#collections'
					active={page === 'collections'}
					onClick={() => setPage('collections')}
				><Icon name='database' style={ICON_STYLE}/> Collections</Menu.Item>
				{[
					'collections',
					'status',
					'journal',
					'notifications',
					'schedule'
				].includes(page) &&
				<Menu.Menu>
					<Menu.Item
						as='a'
						href='#status'
						active={page === 'status'}
						onClick={() => setPage('status')}
					><Icon name='cogs' style={ICON_STYLE}/> Status</Menu.Item>
					<Menu.Item
						as='a'
						href='#journal'
						active={page === 'journal'}
						onClick={() => setPage('journal')}
					><Icon name='newspaper' style={ICON_STYLE}/> Journal</Menu.Item>
					<Menu.Item
						as='a'
						href='#notifications'
						active={page === 'notifications'}
						onClick={() => setPage('notifications')}
					><Icon name='warning' style={ICON_STYLE}/> Notifications</Menu.Item>
					<Menu.Item
						as='a'
						href='#schedule'
						active={page === 'schedule'}
						onClick={() => setPage('schedule')}
					><Icon name='calendar' style={ICON_STYLE}/> Schedule</Menu.Item>
				</Menu.Menu>}

				<Menu.Item
					as='a'
					href='#documentTypes'
					active={page === 'documentTypes'}
					onClick={() => setPage('documentTypes')}
				><Icon name='file' style={ICON_STYLE}/> Document types</Menu.Item>

				{/*[
					'documentTypes',
					'fields',
				].includes(page) &&
				<Menu.Menu>
					<Menu.Item
						as='a'
						href='#fields'
						active={page === 'fields'}
						onClick={() => setPage('fields')}
					><Icon name='list' style={ICON_STYLE}/> Global fields</Menu.Item>
				</Menu.Menu>*/}

				<Menu.Item
					as='a'
					href='#stopWords'
					active={page === 'stopWords'}
					onClick={() => setPage('stopWords')}
				><Icon name='ban' style={ICON_STYLE}/> StopWords</Menu.Item>
				<Menu.Item
					as='a'
					href='#synonyms'
					active={page === 'synonyms'}
					onClick={() => setPage('synonyms')}
				><Icon name='code branch' style={ICON_STYLE}/> Synonyms</Menu.Item>
				<Menu.Item
					as='a'
					href='#interfaces'
					active={page === 'interfaces'}
					onClick={() => setPage('interfaces')}
				><Icon name='plug' style={ICON_STYLE}/> Interfaces</Menu.Item>
				<Menu.Item
					as='a'
					href='#about'
					active={page === 'about'}
					onClick={() => setPage('about')}
				><Icon name='info' style={ICON_STYLE}/> About</Menu.Item>
			</Sidebar>

			<Sidebar.Pusher
				id='myPusher'
				style={{
					padding: '54px 14px 14px',
					width: pusherWidth
				}}
			>
				{/*<Popup
					content={wsStatus}
					trigger={<svg
						height="16"
						style={{
							position: 'fixed',
							right: 13.5,
							top: 53.5
						}}
						preserveAspectRatio="xMidYMid"
						viewBox="0 0 256 193"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill={wsColor}
							d="M192 145h32V68l-36-35-22 22 26 27v63zm32 16H113l-26-27 11-11 22 22h45l-44-45 11-11 44 44V88l-21-22 11-11-55-55H0l32 32h65l24 23-34 34-24-23V48H32v31l55 55-23 22 36 36h156l-32-31z"
						/>
					</svg>}
				/>*/}

				{page === 'home' && <>
					<Header as='h1' content='Explorer'/>
					<Search
						fields={defaultInterfaceFields}
						interfaceName='default'
						searchString=''
					/>
				</>}
				{licenseValid && page === 'api' && <ApiKeys
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'collections' && <Collections
					collectorComponents={collectorComponents}
					licenseValid={licenseValid}
					servicesBaseUrl={servicesBaseUrl}
					setLicensedTo={setLicensedTo}
					setLicenseValid={setLicenseValid}
				/>}
				{page === 'status' && <Status
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'journal' && <Journals
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'notifications' && <Notifications
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'schedule' && <Schedule
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'documentTypes' && <DocumentTypes
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{/*page === 'fields' && <Fields
					servicesBaseUrl={servicesBaseUrl}
				/>*/}
				{page === 'stopWords' && <StopWords
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'synonyms' && <Thesauri
					licenseValid={licenseValid}
					servicesBaseUrl={servicesBaseUrl}
					setLicensedTo={setLicensedTo}
					setLicenseValid={setLicenseValid}
				/>}
				{page === 'interfaces' && <Interfaces
					licenseValid={licenseValid}
					servicesBaseUrl={servicesBaseUrl}
					setLicensedTo={setLicensedTo}
					setLicenseValid={setLicenseValid}
				/>}
				{page === 'about' && <>
					<Header as='h1' content='Licenses'/>
					<Grid columns={3} divided>
						<Grid.Row>
							<Grid.Column>
								<List animated divided relaxed selection>
									{NODE_MODULES.map(({
										description = LICENSE_MIT,
										header,
										href
									}, i) => <List.Item key={i}
										onMouseEnter={() => setShowWhichLicense(description as License)}
										onMouseLeave={() => setShowWhichLicense(undefined)}
									>
										<Icon color='red' size='large' aligned='middle' name='npm'/>
										<List.Content as='a' href={href}>
											<List.Header content={header}/>
											<List.Description content={description}/>
										</List.Content>
									</List.Item>)}
								</List>
							</Grid.Column>
							<Grid.Column>
								<pre>{showWhichLicense === LICENSE_MIT
									? LICENSE_TEXT_MIT
									: showWhichLicense === LICENSE_BSD_3_CLAUSE
										? LICENSE_TEXT_BSD_3_CLAUSE
										: showWhichLicense === LICENSE_BSD_2_CLAUSE
											? LICENSE_TEXT_BSD_2_CLAUSE
											: ''}</pre>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</>}
			</Sidebar.Pusher>
		</Sidebar.Pushable>
	</>;
} // Explorer
