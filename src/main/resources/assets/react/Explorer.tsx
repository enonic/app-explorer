import type {SemanticICONS} from 'semantic-ui-react/src/generic.d';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';
import type {
	CollectorComponents,
} from './index.d';


import * as gql from 'gql-query-builder';
import * as React from 'react';
import {
	Header, Icon, List, Menu, Modal, Sidebar
} from 'semantic-ui-react';

import {Api} from './Api';
import {Collections} from './collection/Collections';
//import {Fields} from './fields/Fields';
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

/*const SIDEBAR_WIDTH_NAME_TO_PX = {
	'very thin': 60,
	'thin': 150,
	undefined: 260,
	'wide': 350,
	'very wide': 475
};*/
//const SIDEBAR_WIDTH = 'very thin';
const SIDEBAR_WIDTH_PX = 260; // 157
const PUSHER_WIDTH = `calc(100% - ${SIDEBAR_WIDTH_PX}px)`;

const GQL_BODY_QUERY_INTERFACES_DEFAULT = JSON.stringify(gql.query({
  operation: 'queryInterfaces',
  fields: [
	  {
		  hits: [
			  {
				  fields: [
					  'name'
				  ]
			  },
		  ]
	  },
  ],
  variables: {
	  query: {
		  required: false,
		  value: "_name = 'default'"
	  }
  }
}));
//console.debug('GQL_BODY_QUERY_INTERFACES_DEFAULT', GQL_BODY_QUERY_INTERFACES_DEFAULT);

/*const PUSHER_STYLE_SIDEBAR_HIDE = {
	padding: '54px 14px 14px',
	transform: 'none',
	'-webkit-transform': 'none',
	width: 'auto'
};

const PUSHER_STYLE_SIDEBAR_SHOW = {
	padding: '54px 14px 14px',
	transform: `translate3d(${SIDEBAR_WIDTH_PX}px, 0, 0)`,
	'-webkit-transform': `translate3d(${SIDEBAR_WIDTH_PX}px, 0, 0)`,
	width: PUSHER_WIDTH
};*/

const NODE_MODULES = [{
	header: 'Classnames', // app-explorer
	href: 'https://github.com/JedWatson/classnames/blob/master/LICENSE'
},{
	header: 'cron-parser', // app-explorer
	href: 'https://github.com/harrisiirak/cron-parser/blob/master/LICENSE'
},{
	header: 'd3-dsv', // lib-explorer
	description: 'BSD 3-Clause',
	href: 'https://github.com/d3/d3-dsv/blob/master/LICENSE'
},{
	header: 'deep-object-diff', // lib/app-explorer
	href: 'https://github.com/mattphillips/deep-object-diff/blob/main/LICENSE'
},{
	header:'fast-deep-equal', // lib/app-explorer
	href: 'https://github.com/epoberezkin/fast-deep-equal/blob/master/LICENSE'
},{
	header: 'fnv-plus', // lib-explorer
	href: 'https://github.com/tjwebb/fnv-plus#license'
},{
	header: 'fomantic-ui-css', // app-explorer
	href: 'https://github.com/fomantic/Fomantic-UI-CSS/blob/master/package.json'
},{
	header: 'GraphQL Query Builder', // app-explorer
	href: 'https://github.com/atulmy/gql-query-builder/blob/master/LICENSE'
},{
	header: 'human-object-diff', // lib-explorer
	href: 'https://github.com/Spence-S/human-object-diff/blob/master/LICENSE'
},{
	header: 'jsdiff', // diff lib/app-explorer
	href: 'https://github.com/kpdecker/jsdiff/blob/master/LICENSE',
	description: 'BSD-3-Clause'
},{
	header: 'jQuery', // lib-explorer
	href: 'https://github.com/jquery/jquery/blob/master/LICENSE.txt'
},{
	header: 'jsUri', // lib/app-explorer
	href: 'https://github.com/derek-watson/jsUri/blob/master/LICENSE'
},{
	header: 'Moment.js',
	href: 'https://github.com/moment/moment/blob/develop/LICENSE'
},{
	header: 'pretty-ms',
	href: 'https://github.com/sindresorhus/pretty-ms/blob/master/license'
},{
	header: 'React and React-DOM',
	href: 'https://github.com/facebook/react/blob/master/LICENSE'
},{
	header: 'React-gantt-antd', // app-explorer
	href: 'https://github.com/JSainsburyPLC/react-timelines/blob/master/LICENSE'
},{
	header: 'RJV react-json-view',
	href: 'https://github.com/mac-s-g/react-json-view/blob/master/LICENSE'
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
	header: 'Serialize JavaScript', // app-explorer
	href: 'https://github.com/yahoo/serialize-javascript/blob/main/LICENSE',
	description: 'BSD-3-Clause'
},{
	header: 'set-in', // app-explorer
	href: 'https://github.com/ahdinosaur/set-in/blob/master/package.json',
	description: 'Apache-2.0'
},{
	header: 'traverse',
	description: 'MIT/X11',
	href: 'https://github.com/substack/js-traverse/blob/master/LICENSE'
},{
	header: 'URI.js', // lib-explorer
	href: 'https://github.com/garycourt/uri-js/blob/master/LICENSE',
	description: 'BSD-2-Clause'
},{
	header: 'uuid', // lib-explorer
	href: 'https://github.com/uuidjs/uuid/blob/main/LICENSE.md'
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


export function Explorer(props :{
	collectorComponents :CollectorComponents
	licensedTo :string
	licenseValid :boolean
	servicesBaseUrl :string
}) {
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
	const [menuIconName, setMenuIconName] = React.useState<SemanticICONS>('close');
	const [defaultInterfaceFields, setDefaultInterfaceFields] = React.useState<Array<InterfaceField>>([]);
	const [page, setPage] = React.useState('home');
	//const [pusherStyle, setPusherStyle] = React.useState(PUSHER_STYLE_SIDEBAR_SHOW);
	const [sideBarVisible, setSideBarVisible] = React.useState(true);
	const [pusherWidth, setPusherWidth] = React.useState(PUSHER_WIDTH);

	//const [websocket, setWebsocket] = React.useState(null);
	//const [queryCollectorsGraph, setQueryCollectorsGraph] = React.useState({});
	//const [fields, setFields] = React.useState({});
	//const [tasks, setTasks] = React.useState([]);
	//console.debug('Explorer tasks', tasks);

	const memoizedQueryInterfacesDefault = React.useCallback(() => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: GQL_BODY_QUERY_INTERFACES_DEFAULT
		})
			.then(response => response.json())
			.then(json => {
				//console.debug(json);
				setDefaultInterfaceFields(json.data.queryInterfaces.hits[0].fields);
			});
	}, [servicesBaseUrl]); // memoizedQueryInterfacesDefault

	React.useEffect(() => {
		memoizedQueryInterfacesDefault();
	}, [memoizedQueryInterfacesDefault]);
	console.debug('defaultInterfaceFields', defaultInterfaceFields);

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

	React.useEffect(() => {
		setMenuIconName(sideBarVisible ? 'close' : 'bars');
	}, [sideBarVisible]);

	const iconStyle = {
		float: 'left',
		margin: '0 7px 0 0'
	};

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
		<Sidebar.Pushable>
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
				><Icon name='search' style={iconStyle}/> Home</Menu.Item>

				{licenseValid && <Menu.Item
					as='a'
					href='#api'
					active={page === 'api'}
					onClick={() => setPage('api')}
				><Icon name='plug' style={iconStyle}/> API</Menu.Item>}
				<Menu.Item
					as='a'
					href='#collections'
					active={page === 'collections'}
					onClick={() => setPage('collections')}
				><Icon name='database' style={iconStyle}/> Collections</Menu.Item>
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
					><Icon name='cogs' style={iconStyle}/> Status</Menu.Item>
					<Menu.Item
						as='a'
						href='#journal'
						active={page === 'journal'}
						onClick={() => setPage('journal')}
					><Icon name='newspaper' style={iconStyle}/> Journal</Menu.Item>
					<Menu.Item
						as='a'
						href='#notifications'
						active={page === 'notifications'}
						onClick={() => setPage('notifications')}
					><Icon name='warning' style={iconStyle}/> Notifications</Menu.Item>
					<Menu.Item
						as='a'
						href='#schedule'
						active={page === 'schedule'}
						onClick={() => setPage('schedule')}
					><Icon name='calendar' style={iconStyle}/> Schedule</Menu.Item>
				</Menu.Menu>}

				<Menu.Item
					as='a'
					href='#documentTypes'
					active={page === 'documentTypes'}
					onClick={() => setPage('documentTypes')}
				><Icon name='file' style={iconStyle}/> Document types</Menu.Item>

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
					><Icon name='list' style={iconStyle}/> Global fields</Menu.Item>
				</Menu.Menu>*/}

				<Menu.Item
					as='a'
					href='#stopWords'
					active={page === 'stopWords'}
					onClick={() => setPage('stopWords')}
				><Icon name='ban' style={iconStyle}/> StopWords</Menu.Item>
				<Menu.Item
					as='a'
					href='#synonyms'
					active={page === 'synonyms'}
					onClick={() => setPage('synonyms')}
				><Icon name='code branch' style={iconStyle}/> Synonyms</Menu.Item>
				<Menu.Item
					as='a'
					href='#interfaces'
					active={page === 'interfaces'}
					onClick={() => setPage('interfaces')}
				><Icon name='plug' style={iconStyle}/> Interfaces</Menu.Item>
				<Menu.Item
					as='a'
					href='#about'
					active={page === 'about'}
					onClick={() => setPage('about')}
				><Icon name='info' style={iconStyle}/> About</Menu.Item>
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
