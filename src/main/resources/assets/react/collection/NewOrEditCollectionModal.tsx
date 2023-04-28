import type {CollectionFormValues} from '@enonic-types/lib-explorer/index.d';
import type {
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '@enonic-types/lib-explorer/Collector.d';
import type {
	CollectorComponents,
	Locales,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';
import type {
	DropdownItemsWithKeys,
	QueryCollectionsHits
} from './index.d';


import * as React from 'react';
import {Button, Icon, Modal, Popup} from 'semantic-ui-react';
import {Collection} from './Collection';
import HoverButton from '../components/buttons/HoverButton';
import {UploadLicense} from '../components/UploadLicense';


export function NewOrEditCollectionModal({
	// Required
	collections,
	collectorComponents,
	collectorOptions,
	contentTypeOptions,
	initialValues,
	fields,
	licenseValid,
	locales,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid,
	siteOptions,
	totalNumberOfCollections,
	// Optional
	_name,
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	defaultOpen = false,
	disabled = false,
	loading = false,
}: {
	// Required
	collections: QueryCollectionsHits
	collectorComponents: CollectorComponents
	collectorOptions: DropdownItemsWithKeys<string>
	contentTypeOptions: ContentTypeOptions
	fields: Fields
	initialValues: CollectionFormValues
	licenseValid: boolean
	locales: Locales
	servicesBaseUrl: string
	setLicensedTo: SetLicensedToFunction
	setLicenseValid: SetLicenseValidFunction
	siteOptions: SiteOptions
	totalNumberOfCollections: number
	// Optional
	_name?: string
	afterClose?: () => void
	beforeOpen?: () => void
	defaultOpen?: boolean
	disabled?: boolean
	loading?: boolean
}) {
	//console.debug('totalNumberOfCollections',totalNumberOfCollections);
	const [state, setState] = React.useState({
		open: defaultOpen
	});
	//console.debug('NewOrEditModal', {props, state});

	const doClose = () => {
		setState({open: false});
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setState({open: true});
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={state.open}
		size='fullscreen'
		trigger={
			_name
				? <Popup
					content={`Edit collection ${_name}`}
					inverted
					trigger={
						<HoverButton
							color='blue'
							disabled={disabled}
							icon='edit'
							loading={loading}
							onClick={doOpen}
						/>
					}
				/>
				: <Button
					circular
					color='green'
					disabled={disabled}
					icon
					loading={loading}
					onClick={doOpen}
					size='massive'
					style={{
						bottom: 13.5,
						position: 'fixed',
						right: 13.5
					}}><Icon
						name='plus'
					/>
				</Button>
		}
	>{licenseValid || totalNumberOfCollections <= 2 // This means it will be allowed to create collection 3, but not number 4
			? <>
				<Modal.Header>{_name ? `Edit collection ${_name}`: 'New collection'}</Modal.Header>
				<Collection
					collections={collections}
					collectorComponents={collectorComponents}
					collectorOptions={collectorOptions}
					contentTypeOptions={contentTypeOptions}
					fields={fields}
					initialValues={initialValues}
					locales={locales}
					doClose={doClose}
					servicesBaseUrl={servicesBaseUrl}
					siteOptions={siteOptions}
				/>
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
			/>}
	</Modal>;
} // NewOrEditModal
