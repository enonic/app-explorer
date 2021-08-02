import {Button, Header, Table} from 'semantic-ui-react';

import {NewOrEditInterfaceModal} from './interfaces/NewOrEditInterfaceModal';
import {CopyModal} from './interfaces/CopyModal';
import {DeleteModal} from './interfaces/DeleteModal';
import {SearchModal} from './interfaces/SearchModal';


/*const INTERFACES_GQL = `queryInterfaces {
	total
	count
	hits {
		_id
		_name
		#_nodeType
		_path
		displayName
		queryJson
		resultMappings {
			field
			highlight
			highlightFragmenter
			highlightNumberOfFragments
			highlightOrder
			highlightPostTag
			highlightPreTag
			lengthLimit
			to
			type
		}
		#type
	}
}`;*/

/*const ALL_GQL = `{
	${INTERFACES_GQL}
}`;*/


export function Interfaces({
	licenseValid,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid
}) {
	const [state, setState] = React.useState({
		interfaceExists: false,
		interfaceTo: '',
		interfaces: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: false
	});

	const memoizedUpdateInterfacesCallback = React.useCallback(() => {
		setState((oldState) => {
			const deref = JSON.parse(JSON.stringify(oldState));
			deref.isLoading = true;
			return deref;
		});
		fetch(`${servicesBaseUrl}/interfaceList`)
			.then(response => response.json())
			.then(data => setState((oldState) => {
				const deref = JSON.parse(JSON.stringify(oldState));
				deref.collectionOptions = data.collectionOptions;
				deref.fieldsObj = data.fieldsObj;
				deref.interfaces = data.interfaces;
				deref.isLoading = false;
				deref.stopWordOptions = data.stopWordOptions;
				deref.thesauriOptions = data.thesauriOptions;
				return deref;
			}));
	}, [servicesBaseUrl]);

	React.useEffect(() => {
		memoizedUpdateInterfacesCallback();
	}, [memoizedUpdateInterfacesCallback]);

	const {
		collectionOptions,
		fieldsObj,
		interfaces: {
			hits,
			total
		},
		stopWordOptions,
		thesauriOptions
	} = state;
	return <>
		<Header as='h1' content='Interfaces'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{hits.map((initialValues, index) => {
					const {displayName, _id, _name} = initialValues;
					//console.debug({displayName, _name, index});
					return <Table.Row key={index}>
						<Table.Cell collapsing>{displayName}</Table.Cell>
						<Table.Cell collapsing>
							<Button.Group>
								<NewOrEditInterfaceModal
									collectionOptions={collectionOptions}
									displayName={displayName}
									fieldsObj={fieldsObj}
									id={_id}
									afterClose={() => memoizedUpdateInterfacesCallback()}
									licenseValid={licenseValid}
									servicesBaseUrl={servicesBaseUrl}
									setLicensedTo={setLicensedTo}
									setLicenseValid={setLicenseValid}
									stopWordOptions={stopWordOptions}
									thesauriOptions={thesauriOptions}
									total={total}
								/>
								<SearchModal
									interfaceName={_name}
									servicesBaseUrl={servicesBaseUrl}
								/>
								<CopyModal
									name={_name}
									updateInterfaces={() => memoizedUpdateInterfacesCallback()}
									servicesBaseUrl={servicesBaseUrl}
								/>
								<DeleteModal
									name={_name}
									disabled={_name === 'default'}
									onClose={() => memoizedUpdateInterfacesCallback()}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditInterfaceModal
			collectionOptions={collectionOptions}
			fieldsObj={fieldsObj}
			afterClose={() => memoizedUpdateInterfacesCallback()}
			licenseValid={licenseValid}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			stopWordOptions={stopWordOptions}
			thesauriOptions={thesauriOptions}
			total={total}
		/>
	</>;
} // function Interfaces
