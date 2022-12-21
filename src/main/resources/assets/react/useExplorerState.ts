import type {SemanticICONS} from 'semantic-ui-react/src/generic.d';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';
import type {License} from './index.d';


import * as gql from 'gql-query-builder';
import * as React from 'react';


const GQL_BODY_QUERY_INTERFACES_DEFAULT = JSON.stringify(gql.query({
	operation: 'queryInterfaces',
	fields: [{
		hits: [{
			fields: [
				'name'
			]
		}]
	}],
	variables: {
		query: {
			required: false,
			value: "_name = 'default'"
		}
	}
}));
//console.debug('GQL_BODY_QUERY_INTERFACES_DEFAULT', GQL_BODY_QUERY_INTERFACES_DEFAULT);


export function useExplorerState({
	initialLicensedTo,
	initialLicenseValid,
	servicesBaseUrl
} :{
	initialLicensedTo :string
	initialLicenseValid :boolean
	servicesBaseUrl :string
}) {
	//console.debug('Explorer initialLicenseValid', initialLicenseValid);
	//const [wsColor, setWsColor] = React.useState('#888888');
	//const [wsStatus, setWsStatus] = React.useState('');
	const [licenseValid, setLicenseValid] = React.useState(initialLicenseValid);
	const [licensedTo, setLicensedTo] = React.useState(initialLicensedTo);
	const [menuIconName, setMenuIconName] = React.useState<SemanticICONS>('close');
	const [defaultInterfaceFields, setDefaultInterfaceFields] = React.useState<Array<InterfaceField>>([]);
	//const [pusherStyle, setPusherStyle] = React.useState(PUSHER_STYLE_SIDEBAR_SHOW);
	const [sideBarVisible, setSideBarVisible] = React.useState(false); // DEBUG
	const [showWhichLicense, setShowWhichLicense] = React.useState<License>();

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
	//console.debug('defaultInterfaceFields', defaultInterfaceFields);

	// React.useEffect(() => {
	// 	const wsUrl = wsBaseUrl + '/ws';
	// 	//console.debug('wsUrl', wsUrl);
	//
	// 	let intervalId = null;
	// 	const reconnectingWs = () => {
	// 		setWsColor('#000000');
	// 		setWsStatus('WebSocket Connecting...');
	// 		const ws = new WebSocket(wsUrl); //open
	// 		setWebsocket(ws);
	// 		ws.onopen = (event) => {
	// 			setWsColor('#00FF00');
	// 			setWsStatus('WebSocket Connection Open');
	// 			//console.debug('event', event);
	// 			ws.send('subscribe');
	// 			clearInterval(intervalId); // Make sure there are never more than one interval going.
	// 			intervalId = setInterval(() => { // Keep-alive
	// 				//console.debug('Sending ping', Date.now());
	// 				//console.debug('ws.readyState', ws.readyState);
	// 				//0	CONNECTING	Socket has been created. The connection is not yet open.
	// 				//1	OPEN	The connection is open and ready to communicate.
	// 				//2	CLOSING	The connection is in the process of closing.
	// 				//3	CLOSED	The connection is closed or couldn't be opened.
	// 				if (ws.readyState === 1) {
	// 					setWsColor('#FFFF00');
	// 					ws.send('ping');
	// 					setWsStatus('WebSocket Client Sent Ping...');
	// 				} else if (ws.readyState === 2 || ws.readyState === 3) {
	// 					setWsColor('#FFA500');
	// 					setWsStatus('WebSocket Client Reconnecting...');
	// 					reconnectingWs();
	// 					// Fails to connect when server is still down.
	// 					// Fails to connect to restarted server because credentials are no longer valid.
	// 					// But should work when server has not been down, aka other reasons why socket has been closed. For example client has been sleeping.
	// 				}
	// 			}, 30000); // Every 30 seconds
	// 			/*setTimeout(() => { // Keep-alive
	// 				console.debug('Sending initial ping');
	// 				ws.send('ping'); // Date.now()
	// 			}, 30000); // In 30 seconds
	// 		}; // onopen
	//
	// 		ws.onmessage = (event) => {
	// 			//console.debug('event', event);
	// 			setWsColor('#00FF00');
	// 			setWsStatus('WebSocket Client Received Message');
	// 			const {data, type} = JSON.parse(event.data);
	// 			//console.debug('data', data);
	// 			//console.debug('type', type);
	// 			if (type === 'pong') {
	// 				// Do nothing
	// 			} else if (type === 'initialize') {
	// 				//console.debug('data', data);
	// 				const {
	// 					data:{
	// 						//queryCollections,
	// 						//queryCollectors//,
	// 						//queryFields//,
	// 						//queryTasks
	// 					}// = {},
	// 					//errors // [{errorType, message, locations, validationErrorType}]
	// 				} = data;
	// 				//console.debug('queryCollections', queryCollections);
	// 				//console.debug('queryCollectors', queryCollectors);
	// 				//console.debug('queryFields', queryFields);
	// 				//console.debug('queryTasks', queryTasks);
	// 				//setQueryCollectorsGraph(queryCollectors);
	// 				//setFields(queryFields);
	// 				//setTasks(queryTasks);
	// 			} /*else if (type === 'collectors') {
	// 				const {data:{
	// 					queryCollectors
	// 				}} = data;
	// 				//console.debug('queryCollectors', queryCollectors);
	// 				setQueryCollectorsGraph(queryCollectors);
	// 			} /*else if (type === 'fields') {
	// 				const {data:{
	// 					queryFields
	// 				}} = data;
	// 				//console.debug('queryFields', queryFields);
	// 				setFields(queryFields);
	// 			} else if (type === 'license') {
	// 				//console.debug('type', type);
	// 				//console.debug('data', data);
	// 				setLicensedTo(data.licensedTo);
	// 				setLicenseValid(data.licenseValid);
	// 			}
	// 			/*setTimeout(() => { // Keep-alive
	// 				console.debug('Sending ping');
	// 				ws.send('ping'); // Date.now()
	// 			}, 30000); // In 30 seconds
	// 		}; // onmessage
	//
	// 		ws.onerror = (event) => {
	// 			console.error('WebSocket error observed:', event);
	// 			setWsColor('#FF0000');
	// 			setWsStatus('WebSocket Client Error!')
	// 			ws.close();
	// 		};
	//
	// 		ws.onclose = (event) => {
	// 			// As soon as I stop the Enonic Server I get this event :)
	// 			console.log('WebSocket is closed now.', event);
	// 			setWsColor('#FF0000');
	// 			setWsStatus('WebSocket Connection Closed!')
	// 		};
	// 	} // reconnectingWs
	// 	reconnectingWs();
	// }, []); // useEffect

	React.useEffect(() => {
		setMenuIconName(sideBarVisible ? 'close' : 'bars');
	}, [sideBarVisible]);

	return {
		defaultInterfaceFields,
		licensedTo, setLicensedTo,
		licenseValid, setLicenseValid,
		menuIconName,
		showWhichLicense, setShowWhichLicense,
		sideBarVisible, setSideBarVisible,
	};
}
