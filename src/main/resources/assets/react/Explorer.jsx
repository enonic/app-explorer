import {Header, Icon, List, Menu, Sidebar} from 'semantic-ui-react';

import {Collections} from './Collections';
import {Fields} from './Fields';
import {Interfaces} from './Interfaces';
import {Journals} from './Journals';
import {Notifications} from './Notifications';
//import {Scheduling} from './Scheduling';
import {Search} from './Search';
import {Status} from './Status';
import {StopWords} from './StopWords';
import {Thesauri} from './Thesauri';


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
},{
	header: 'react-scrollspy',
	href: 'https://github.com/makotot/react-scrollspy/blob/master/LICENSE'
},{
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
},{
	header: 'uuid',
	href: 'https://github.com/kelektiv/node-uuid/blob/master/LICENSE.md'
}];


export function Explorer(props) {
	//console.debug('Explorer props', props);
	const {
		collectorsObj,
		licenseValid: initialLicenseValid,
		servicesBaseUrl,
		wsBaseUrl
	} = props;
	//console.debug('Explorer initialLicenseValid', initialLicenseValid);

	const [licenseValid, setLicenseValid] = React.useState(initialLicenseValid);
	const [page, setPage] = React.useState('home');
	const [sideBarVisible, setSideBarVisible] = React.useState(true);
	const [pusherWidth, setPusherWidth] = React.useState('calc(100% - 260px)');
	const [collections, setCollections] = React.useState({});
	//console.debug('collections', collections);

	React.useEffect(() => {
		const hashPage = window.location.hash.substring(1);
		if (hashPage) { setPage(hashPage); }

		const wsUrl = wsBaseUrl + '/collectionListWs';
		//console.debug('wsUrl', wsUrl);
		const ws = new WebSocket(wsUrl); //open

		ws.onopen = (event) => {
			//console.debug('event', event);
			ws.send('subscribe');
		} // onopen

		ws.onmessage = (event) => {
			//console.debug('event', event);
			const {data: {queryCollections}} = JSON.parse(event.data);
			//console.debug('queryCollections', queryCollections);
			setCollections(queryCollections);
		} // onmessage
	}, []); // useEffect

	return <>
		<Menu fixed='top' inverted style={{zIndex: 103}}>
			<Menu.Item as='a' onClick={() => setSideBarVisible(!sideBarVisible)}>
				<Icon name='close'/>
			</Menu.Item>
			<Menu.Item header>Explorer</Menu.Item>
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
					'notifications'//, 'scheduling'
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
					{/*<Menu.Item
						as='a'
						href='#scheduling'
						active={page === 'scheduling'}
						onClick={() => setPage('scheduling')}
					><Icon name='calendar'/> Scheduling</Menu.Item>*/}
				</Menu.Menu>}

				<Menu.Item
					as='a'
					href='#fields'
					active={page === 'fields'}
					onClick={() => setPage('fields')}
				><Icon name='sitemap'/> Fields</Menu.Item>
				<Menu.Item
					as='a'
					href='#stopWords'
					active={page === 'stopWords'}
					onClick={() => setPage('stopWords')}
				><Icon name='crop'/> StopWords</Menu.Item>
				<Menu.Item
					as='a'
					href='#thesauri'
					active={page === 'thesauri'}
					onClick={() => setPage('thesauri')}
				><Icon name='font'/> Thesauri</Menu.Item>
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
				{page === 'home' && <>
					<Header as='h1' content='Explorer'/>
					<Search
						interfaceName='default'
						searchString=''
						servicesBaseUrl={servicesBaseUrl}
					/>
				</>}
				{page === 'collections' && <Collections
					collectionsObj={collections}
					collectorsObj={collectorsObj}
					licenseValid={licenseValid}
					servicesBaseUrl={servicesBaseUrl}
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
				{/*page === 'scheduling' && <Scheduling
					servicesBaseUrl={servicesBaseUrl}
				/>*/}
				{page === 'fields' && <Fields
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'stopWords' && <StopWords
					servicesBaseUrl={servicesBaseUrl}
				/>}
				{page === 'thesauri' && <Thesauri
					licenseValid={licenseValid}
					servicesBaseUrl={servicesBaseUrl}
					setLicenseValid={setLicenseValid}
				/>}
				{page === 'interfaces' && <Interfaces
					licenseValid={licenseValid}
					servicesBaseUrl={servicesBaseUrl}
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
