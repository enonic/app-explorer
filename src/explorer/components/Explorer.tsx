import type {ExplorerProps} from '/index.d';


import {
	Route,
	Routes,
} from 'react-router-dom';
import {
	Header, Sidebar
} from 'semantic-ui-react';
import {ApiKeys} from '../api/ApiKeys';
import {Collections} from '../collection/Collections';
import {Interfaces} from '../interfaces/Interfaces';
import {Journals} from '../journal/Journals';
import {Notifications} from '../notifications/Notifications';
import {Schedule} from '../schedule/Schedule';
import {Documents} from '../document/Documents';
import {DocumentTypes} from '../documentTypes/DocumentTypes';
import {Search} from '../interfaces/search/Search';
import {Status} from '../collection/Status';
import {StopWords} from '../stopWords/StopWords';
import {Thesauri} from '../thesaurus/Thesauri';

import About from './About';
import GraphiQLRouted from './GraphiQLRouted';
import LoadingModal from './modals/LoadingModal';
import SideBarMenu from './SideBarMenu';
import TopBarMenu from './TopBarMenu';
import User from '../user/User';
import useExplorerState from './useExplorerState';


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


function Explorer({
	basename,
	collectorComponents,
	licensedTo: initialLicensedTo,
	licenseValid: initialLicenseValid,
	servicesBaseUrl,
}: ExplorerProps) {
	// console.debug('basename', basename);
	const {
		defaultInterfaceFields,
		fetchInterfaces, interfaceOptions,
		interfaceNameState, setInterfaceNameState,
		licensedTo, setLicensedTo,
		licenseValid, setLicenseValid,
		loadingModalState, setLoadingModalState,
		menuIconName,
		searchString, setSearchString,
		showWhichLicense, setShowWhichLicense,
		sideBarVisible, setSideBarVisible,
		userState, // setUserState,
	} = useExplorerState({
		initialLicensedTo,
		initialLicenseValid,
		servicesBaseUrl
	});
	return <>
		<TopBarMenu
			interfaceNameState={interfaceNameState} setInterfaceNameState={setInterfaceNameState}
			interfaceOptions={interfaceOptions}
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
				setSideBarVisible={setSideBarVisible}
				sideBarVisible={sideBarVisible}
			/>
			<Sidebar.Pusher
				id='myPusher'
			>
				<Routes>
					<Route path="/" element={<>
						<Header
							as='h1'
							className='mt-1rem'
							content='Search all documents'
							textAlign='center'
						/>
						<Search
							basename={basename}
							fields={defaultInterfaceFields}
							interfaceNameState={interfaceNameState} setInterfaceNameState={setInterfaceNameState}
							interfaceOptions={interfaceOptions}
							searchString={searchString} setSearchString={setSearchString}
							servicesBaseUrl={servicesBaseUrl}
						/>
					</>}/>
					<Route path="/collections" element={<Collections
						collectorComponents={collectorComponents}
						licenseValid={licenseValid}
						servicesBaseUrl={servicesBaseUrl}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
					/>}/>
					<Route path="/collections/create" element={<Collections
						collectorComponents={collectorComponents}
						licenseValid={licenseValid}
						newCollectionModalOpen={true}
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
						fetchInterfaces={fetchInterfaces}
						licenseValid={licenseValid}
						searchString={searchString} setSearchString={setSearchString}
						servicesBaseUrl={servicesBaseUrl}
						setInterfaceNameState={setInterfaceNameState}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
					/>}/>
					<Route path="/interfaces/create" element={<Interfaces
						basename={basename}
						fetchInterfaces={fetchInterfaces}
						licenseValid={licenseValid}
						newInterfaceModalOpen={true}
						searchString={searchString} setSearchString={setSearchString}
						servicesBaseUrl={servicesBaseUrl}
						setInterfaceNameState={setInterfaceNameState}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
					/>}/>
					<Route path="/api" element={<GraphiQLRouted
						basename={basename}
						interfaceNameState={interfaceNameState}
						interfaceOptions={interfaceOptions}
						searchString={searchString}
					/>}/>
					<Route path="/api/keys" element={<ApiKeys
						servicesBaseUrl={servicesBaseUrl}
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
		<LoadingModal
			state={loadingModalState}
			setState={setLoadingModalState}
		/>
	</>;
}


export default Explorer;
