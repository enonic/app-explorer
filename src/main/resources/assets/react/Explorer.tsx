import type {ExplorerProps} from '/index.d';


import {
	BrowserRouter as Router,
	Route,
	Routes,
} from 'react-router-dom';
import {
	Header, Sidebar
} from 'semantic-ui-react';
import {ApiKeys} from './api/ApiKeys';
import {Collections} from './collection/Collections';
import {Interfaces} from './interfaces/Interfaces';
import {Journals} from './journal/Journals';
import {Notifications} from './notifications/Notifications';
import {Schedule} from './schedule/Schedule';
import {Documents} from './document/Documents';
import {DocumentTypes} from './documentTypes/DocumentTypes';
import {Search} from './interfaces/search/Search';
import {Status} from './Status';
import {StopWords} from './stopWords/StopWords';
import {Thesauri} from './thesaurus/Thesauri';
import About from './components/About';
import SideBarMenu from './components/SideBarMenu';
import TopBarMenu from './components/TopBarMenu';
import User from './user/User';
import {useExplorerState} from './useExplorerState';


// const handleRender: React.ComponentProps<typeof React.Profiler>["onRender"] = (
// 	id,
// 	phase,
// 	actualDuration,
// 	baseDuration,
// 	startTime,
// 	commitTime,
// 	interactions
// ) => {
// 	console.debug(
// 		'id:', id,
// 		'phase:', phase,
// 		'actualDuration:', actualDuration,
// 		'baseDuration:', baseDuration,
// 		'startTime:', startTime,
// 		'commitTime:', commitTime,
// 		'interactions:', interactions
// 	);
// }


export function Explorer({
	basename,
	collectorComponents,
	licensedTo: initialLicensedTo,
	licenseValid: initialLicenseValid,
	servicesBaseUrl,
}: ExplorerProps) {
	// console.debug('basename', basename);
	const {
		defaultInterfaceFields,
		licensedTo, setLicensedTo,
		licenseValid, setLicenseValid,
		menuIconName,
		showWhichLicense, setShowWhichLicense,
		sideBarVisible, setSideBarVisible,
		userState, // setUserState,
	} = useExplorerState({
		initialLicensedTo,
		initialLicenseValid,
		servicesBaseUrl
	});
	return <Router basename={basename}>
		<TopBarMenu
			licensedTo={licensedTo} setLicensedTo={setLicensedTo}
			licenseValid={licenseValid} setLicenseValid={setLicenseValid}
			menuIconName={menuIconName}
			servicesBaseUrl={servicesBaseUrl}
			sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible}
			userState={userState}
		/>
		<Sidebar.Pushable
			id='explorerPushable'>
			<SideBarMenu
				licenseValid={licenseValid}
				setSideBarVisible={setSideBarVisible}
				sideBarVisible={sideBarVisible}
			/>
			<Sidebar.Pusher
				id='myPusher'
			>
				<Routes>
					<Route path="/" element={<>
						<Header as='h1' content='Explorer' textAlign='center'/>
						<Search
							basename={basename}
							fields={defaultInterfaceFields}
							interfaceName='default'
							searchString=''
							servicesBaseUrl={servicesBaseUrl}
						/>
					</>}/>
					{licenseValid
						? <Route path="/api" element={<ApiKeys
							servicesBaseUrl={servicesBaseUrl}
						/>}/>
						: null
					}
					<Route path="/collections" element={<Collections
						collectorComponents={collectorComponents}
						licenseValid={licenseValid}
						servicesBaseUrl={servicesBaseUrl}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
					/>}/>
					<Route path="/collections/status" element={<Status
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/collections/journal" element={<Journals
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/collections/notifications" element={<Notifications
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/collections/schedule" element={<Schedule
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/documents" element={<Documents
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/documentTypes" element={<DocumentTypes
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/stopWords" element={<StopWords
						servicesBaseUrl={servicesBaseUrl}
					/>}/>
					<Route path="/synonyms" element={<Thesauri
						licenseValid={licenseValid}
						servicesBaseUrl={servicesBaseUrl}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
					/>}/>
					<Route path="/interfaces" element={<Interfaces
						basename={basename}
						licenseValid={licenseValid}
						servicesBaseUrl={servicesBaseUrl}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
					/>}/>
					<Route path="/about" element={<About
						showWhichLicense={showWhichLicense}
						setShowWhichLicense={setShowWhichLicense}
					/>}/>
					<Route path="/user" element={<User
						servicesBaseUrl={servicesBaseUrl}
						userState={userState}
					/>}/>
					<Route path='*' element={<Header content="URL doesn't exist"/>}/>
				</Routes>
			</Sidebar.Pusher>
		</Sidebar.Pushable>
	</Router>;
}
