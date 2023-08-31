import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';

import * as gql from 'gql-query-builder';
import * as React from 'react';
import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';
import { UploadLicense } from '../components/UploadLicense';
import {repoIdValidator} from '../utils/repoIdValidator';


export function CollectionCopyModal({
	// Required
	collectionId,
	collectionNames,
	servicesBaseUrl,
	setCopyModalCollectionId,
	setLicensedTo,
	setLicenseValid,
	// Optional
	afterSuccess = () => {/**/},
	showUploadLicense = true,
} :{
	// Required
	collectionId: string
	collectionNames: string[]
	servicesBaseUrl: string
	setCopyModalCollectionId: React.Dispatch<React.SetStateAction<string>>
	setLicensedTo: SetLicensedToFunction
	setLicenseValid: SetLicenseValidFunction
	// Optional
	afterSuccess ?:() => void
	showUploadLicense?: boolean
}) {
	const [toName, setToName] = React.useState('');
	const [nameError, setNameError] = React.useState<false|string>(false);

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={() => {
			// console.debug('onClose');
			setCopyModalCollectionId(undefined);
		}}
		open={true /* We're not using this, the component is replaced with null on close */}
	>{
		showUploadLicense
			? <UploadLicense
					servicesBaseUrl={servicesBaseUrl}
					setLicensedTo={setLicensedTo}
					setLicenseValid={setLicenseValid}
			/>
			: <>
				<Modal.Header>Copy Collection</Modal.Header>
				<Modal.Content>
					<Input
						error={!!nameError}
						onChange={(_event,{value} :{value: string}) => {
							// console.debug('onChange value', value);
							setToName(value);
							const msg = repoIdValidator(value);
							if (msg) {
								setNameError(msg);
							} else if (collectionNames.includes(value)) {
								setNameError(`Collection with name:${value} already exists!`);
							} else {
								setNameError(undefined);
							}
						}}
						placeholder='Please input name'
					/>
					{nameError ? <Message
						icon='warning sign'
						header='Error'
						content={nameError}
						negative
					/> : null}
				</Modal.Content>
				<Modal.Actions>
					<Button onClick={() => {
						setCopyModalCollectionId(undefined);
					}}>Cancel</Button>
					<Button
						icon
						disabled={!!nameError}
						onClick={() => {
							fetch(`${servicesBaseUrl}/graphQL`, {
								headers: { // HTTP/2 uses lowercase header keys
									'content-type': 'application/json'
								},
								method: 'POST',
								body: JSON.stringify(gql.mutation({
									operation: 'copyCollection',
									variables: {
										_id: {
											required: true,
											type: 'ID',
											value: collectionId
										},
										toName: {
											required: true,
											type: 'String',
											value: toName
										}
									},
									fields: [
										'_id'
									]
								}))
							}).then(() => {
								// TODO: Handle errors?
								setCopyModalCollectionId(undefined); // This will unmount this component.
								afterSuccess(); // This could trigger render in parent, and unmount this Component.
							});
						}}
						primary
					><Icon name='copy'/> Copy</Button>
				</Modal.Actions>
			</>
	}</Modal>;
}
