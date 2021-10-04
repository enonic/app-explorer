import {
	Header, Icon, List, Menu, Modal, Sidebar
} from 'semantic-ui-react';

import {Api} from './Api';
import {Collections} from './collection/Collections';
import {Fields} from './fields/Fields';
import {Interfaces} from './interfaces/Interfaces';
import {Journals} from './Journals';
import {Notifications} from './Notifications';
import {Schedule} from './Schedule';
import {DocumentTypes} from './documentTypes/DocumentTypes';
import {Search} from './Search';
import {Status} from './Status';
import {StopWords} from './stopWords/StopWords';
import {Thesauri} from './thesaurus/Thesauri';
import {UploadLicense} from './UploadLicense';


const NODE_MODULES = [{
	header: 'Classnames',
	href: 'https://github.com/JedWatson/classnames/blob/master/LICENSE'
},{
	header: 'd3-dsv', // lib-explorer
	description: 'BSD 3-Clause',
	href: 'https://github.com/d3/d3-dsv/blob/master/LICENSE'
},{
	header: 'deepmerge', // lib-explorer-client
	href: 'https://github.com/TehShrike/deepmerge/blob/master/license.txt'
},{
	header: 'fnv-plus', // lib-explorer
	href: 'https://github.com/tjwebb/fnv-plus#license'
},{
	header: 'highlight-search-result', // lib-explorer
	href: 'https://github.com/dominictarr/highlight-search-result/blob/master/LICENSE'
},{
	header: 'jQuery', // lib-explorer
	href: 'https://github.com/jquery/jquery/blob/master/LICENSE.txt'
},{
	header: 'jsUri',
	href: 'https://github.com/derek-watson/jsUri/blob/master/LICENSE'
},{
	header: 'Moment.js',
	href: 'https://github.com/moment/moment/blob/develop/LICENSE'
},{
	header: 'pretty-ms',
	href: 'https://github.com/sindresorhus/pretty-ms/blob/master/license'
},{
	header: 'React and React-dom',
	href: 'https://github.com/facebook/react/blob/master/LICENSE'
},/*{
	header: 'react-scrollspy',
	href: 'https://github.com/makotot/react-scrollspy/blob/master/LICENSE'
},*/{
	header: 'Semantic UI',
	href: 'https://github.com/Semantic-Org/Semantic-UI/blob/master/LICENSE.md'
},{
	header: 'Semantic UI React',
	href: 'https://github.com/jhudson8/react-semantic-ui/blob/master/LICENSE'
},{
	header: 'striptags', // lib-explorer-client
	href: 'https://github.com/ericnorris/striptags/blob/master/LICENSE'
},{
	header: 'traverse',
	description: 'MIT/X11',
	href: 'https://github.com/substack/js-traverse/blob/master/LICENSE'
}];


const UploadLicenseModal = (props) => {
	//console.debug('props', props);
	const {
		licenseValid,
		licensedTo,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
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


export function Explorer(props) {
	//console.debug('Explorer props', props);
	const {
		collectorComponents,
		licensedTo: initialLicensedTo,
		licenseValid: initialLicenseValid,
		servicesBaseUrl//,
		//wsBaseUrl
	} = props;
	//console.debug('Explorer initialLicenseValid', initialLicenseValid);

	//const [wsColor, setWsColor] = React.useState('#888888');
	//const [wsStatus, setWsStatus] = React.useState('');
	const [licenseValid, setLicenseValid] = React.useState(initialLicenseValid);
	const [licensedTo, setLicensedTo] = React.useState(initialLicensedTo);
	const [page, setPage] = React.useState('home');
	const [sideBarVisible, setSideBarVisible] = React.useState(true);
	const [pusherWidth, setPusherWidth] = React.useState('calc(100% - 260px)');

	//const [websocket, setWebsocket] = React.useState(null);
	//const [queryCollectorsGraph, setQueryCollectorsGraph] = React.useState({});
	//const [fields, setFields] = React.useState({});
	//const [tasks, setTasks] = React.useState([]);
	//console.debug('Explorer tasks', tasks);

	React.useEffect(() => {
		const hashPage = window.location.hash.substring(1);
		if (hashPage) { setPage(hashPage); }

		/*const wsUrl = wsBaseUrl + '/ws';
		//console.debug('wsUrl', wsUrl);

		let intervalId = null;
		const reconnectingWs = () => {
			setWsColor('#000000');
			setWsStatus('WebSocket Connecting...');
			const ws = new WebSocket(wsUrl); //open
			setWebsocket(ws);
			ws.onopen = (event) => {
				setWsColor('#00FF00');
				setWsStatus('WebSocket Connection Open');
				//console.debug('event', event);
				ws.send('subscribe');
				clearInterval(intervalId); // Make sure there are never more than one interval going.
				intervalId = setInterval(() => { // Keep-alive
					//console.debug('Sending ping', Date.now());
					//console.debug('ws.readyState', ws.readyState);
					//0	CONNECTING	Socket has been created. The connection is not yet open.
					//1	OPEN	The connection is open and ready to communicate.
					//2	CLOSING	The connection is in the process of closing.
					//3	CLOSED	The connection is closed or couldn't be opened.
					if (ws.readyState === 1) {
						setWsColor('#FFFF00');
						ws.send('ping');
						setWsStatus('WebSocket Client Sent Ping...');
					} else if (ws.readyState === 2 || ws.readyState === 3) {
						setWsColor('#FFA500');
						setWsStatus('WebSocket Client Reconnecting...');
						reconnectingWs();
						// Fails to connect when server is still down.
						// Fails to connect to restarted server because credentials are no longer valid.
						// But should work when server has not been down, aka other reasons why socket has been closed. For example client has been sleeping.
					}
				}, 30000); // Every 30 seconds
				/*setTimeout(() => { // Keep-alive
					console.debug('Sending initial ping');
					ws.send('ping'); // Date.now()
				}, 30000); // In 30 seconds
			}; // onopen

			ws.onmessage = (event) => {
				//console.debug('event', event);
				setWsColor('#00FF00');
				setWsStatus('WebSocket Client Received Message');
				const {data, type} = JSON.parse(event.data);
				//console.debug('data', data);
				//console.debug('type', type);
				if (type === 'pong') {
					// Do nothing
				} else if (type === 'initialize') {
					//console.debug('data', data);
					const {
						data:{
							//queryCollections,
							//queryCollectors//,
							//queryFields//,
							//queryTasks
						}// = {},
						//errors // [{errorType, message, locations, validationErrorType}]
					} = data;
					//console.debug('queryCollections', queryCollections);
					//console.debug('queryCollectors', queryCollectors);
					//console.debug('queryFields', queryFields);
					//console.debug('queryTasks', queryTasks);
					//setQueryCollectorsGraph(queryCollectors);
					//setFields(queryFields);
					//setTasks(queryTasks);
				} /*else if (type === 'collectors') {
					const {data:{
						queryCollectors
					}} = data;
					//console.debug('queryCollectors', queryCollectors);
					setQueryCollectorsGraph(queryCollectors);
				} /*else if (type === 'fields') {
					const {data:{
						queryFields
					}} = data;
					//console.debug('queryFields', queryFields);
					setFields(queryFields);
				} else if (type === 'license') {
					//console.debug('type', type);
					//console.debug('data', data);
					setLicensedTo(data.licensedTo);
					setLicenseValid(data.licenseValid);
				}
				/*setTimeout(() => { // Keep-alive
					console.debug('Sending ping');
					ws.send('ping'); // Date.now()
				}, 30000); // In 30 seconds
			}; // onmessage

			ws.onerror = (event) => {
				console.error('WebSocket error observed:', event);
				setWsColor('#FF0000');
				setWsStatus('WebSocket Client Error!')
				ws.close();
			};

			ws.onclose = (event) => {
				// As soon as I stop the Enonic Server I get this event :)
				console.log('WebSocket is closed now.', event);
				setWsColor('#FF0000');
				setWsStatus('WebSocket Connection Closed!')
			};
		} // reconnectingWs
		reconnectingWs();*/
	}, []); // useEffect

	return <>
		<Menu fixed='top' inverted style={{zIndex: 103}}>
			<Menu.Item as='a' onClick={() => setSideBarVisible(!sideBarVisible)}>
				<Icon name='close'/>
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

		<Sidebar.Pushable>
			<Sidebar
				as={Menu}
				id='mySidebar'
				inverted
				onHidden={() => {
					setPusherWidth('auto');
				}}
				onShow={() => {
					setPusherWidth('calc(100% - 260px)');
				}}
				style={{
					paddingTop: 40
				}}
				vertical
				visible={sideBarVisible}
			>
				<Menu.Item
					as='a'
					href='#home'
					active={page === 'home'}
					onClick={() => setPage('home')}
				><Icon name='search'/> Home</Menu.Item>

				{licenseValid && <Menu.Item
					as='a'
					href='#api'
					active={page === 'api'}
					onClick={() => setPage('api')}
				><Icon name='plug'/> API</Menu.Item>}
				<Menu.Item
					as='a'
					href='#collections'
					active={page === 'collections'}
					onClick={() => setPage('collections')}
				><Icon name='database'/> Collections</Menu.Item>
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
					><Icon name='cogs'/> Status</Menu.Item>
					<Menu.Item
						as='a'
						href='#journal'
						active={page === 'journal'}
						onClick={() => setPage('journal')}
					><Icon name='newspaper'/> Journal</Menu.Item>
					<Menu.Item
						as='a'
						href='#notifications'
						active={page === 'notifications'}
						onClick={() => setPage('notifications')}
					><Icon name='warning'/> Notifications</Menu.Item>
					<Menu.Item
						as='a'
						href='#schedule'
						active={page === 'schedule'}
						onClick={() => setPage('schedule')}
					><Icon name='calendar'/> Schedule</Menu.Item>
				</Menu.Menu>}

				<Menu.Item
					as='a'
					href='#documentTypes'
					active={page === 'documentTypes'}
					onClick={() => setPage('documentTypes')}
				><Icon name='file'/> Document types</Menu.Item>
				<Menu.Item
					as='a'
					href='#fields'
					active={page === 'fields'}
					onClick={() => setPage('fields')}
				><Icon name='list'/> Global fields</Menu.Item>
				<Menu.Item
					as='a'
					href='#stopWords'
					active={page === 'stopWords'}
					onClick={() => setPage('stopWords')}
				><Icon name='crop'/> StopWords</Menu.Item>
				<Menu.Item
					as='a'
					href='#synonyms'
					active={page === 'synonyms'}
					onClick={() => setPage('synonyms')}
				><Icon name='font'/> Synonyms</Menu.Item>
				<Menu.Item
					as='a'
					href='#interfaces'
					active={page === 'interfaces'}
					onClick={() => setPage('interfaces')}
				><Icon name='plug'/> Interfaces</Menu.Item>
				<Menu.Item
					as='a'
					href='#about'
					active={page === 'about'}
					onClick={() => setPage('about')}
				><Icon name='info'/> About</Menu.Item>
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
						interfaceName='default'
						searchString=''
						servicesBaseUrl={servicesBaseUrl}
					/>
				</>}
				{licenseValid && page === 'api' && <Api
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
				{page === 'fields' && <Fields
					servicesBaseUrl={servicesBaseUrl}
				/>}
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
					<List animated divided relaxed selection>
						{NODE_MODULES.map(({
							description = 'MIT',
							header,
							href
						}, i) => <List.Item key={i}>
							<Icon color='red' size='large' aligned='middle' name='npm'/>
							<List.Content as='a' href={href}>
								<List.Header content={header}/>
								<List.Description content={description}/>
							</List.Content>
						</List.Item>)}
					</List>
				</>}
			</Sidebar.Pusher>
		</Sidebar.Pushable>
	</>;
} // Explorer
