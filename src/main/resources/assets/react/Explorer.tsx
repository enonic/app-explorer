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
import {Search} from './search/Search';
import {Status} from './Status';
import {StopWords} from './stopWords/StopWords';
import {Thesauri} from './thesaurus/Thesauri';
import About from './components/About';
import SideBarMenu from './components/SideBarMenu';
import TopBarMenu from './components/TopBarMenu';
import {useExplorerState} from './useExplorerState';


export function Explorer({
	basename,
	collectorComponents,
	licensedTo: initialLicensedTo,
	licenseValid: initialLicenseValid,
	servicesBaseUrl,
}: ExplorerProps) {
	const {
		defaultInterfaceFields,
		licensedTo, setLicensedTo,
		licenseValid, setLicenseValid,
		menuIconName,
		showWhichLicense, setShowWhichLicense,
		sideBarVisible, setSideBarVisible,
	} = useExplorerState({
		initialLicensedTo,
		initialLicenseValid,
		servicesBaseUrl
	});
	return <>
		<TopBarMenu
			licensedTo={licensedTo} setLicensedTo={setLicensedTo}
			licenseValid={licenseValid} setLicenseValid={setLicenseValid}
			menuIconName={menuIconName}
			servicesBaseUrl={servicesBaseUrl}
			sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible}
		/>
		<Sidebar.Pushable
			id='explorerPushable'>
			<Router basename={basename}>
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
							licenseValid={licenseValid}
							servicesBaseUrl={servicesBaseUrl}
							setLicensedTo={setLicensedTo}
							setLicenseValid={setLicenseValid}
						/>}/>
						<Route path="/about" element={<About
							showWhichLicense={showWhichLicense}
							setShowWhichLicense={setShowWhichLicense}
						/>}/>
						<Route element={<Header content="URL doesn't exist"/>}/>
					</Routes>
				</Sidebar.Pusher>
			</Router>
		</Sidebar.Pushable>
	</>;
}
