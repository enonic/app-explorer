import type {SearchProps} from './useSearchState';
//import type {AnyObject} from '@enonic/js-utils/src/types';
//import type {Fields} from '/lib/explorer/types/Field.d';

/*import {
	getIn,
	setIn//,
	//ucFirst
} from '@enonic/js-utils';*/
import { Link } from 'react-router-dom';
import {
	Container,
	Dropdown,
	Header,
	Segment
} from 'semantic-ui-react';
import Flex from '../../components/Flex';
import SearchInput from '../../components/inputs/SearchInput';
import DocumentsTable from '../../document/DocumentsTable';
// import {Hits} from './Hits';
import {Accordion} from './Accordion';
import {useSearchState} from './useSearchState';
import { Column } from '../../document/constants';

//type CacheKey = `${InterfaceName}.${SearchString}`;
//type Cache = Record<CacheKey,SearchResult>;
//const forceArray = data => Array.isArray(data) ? data : [data];


export function Search(props: SearchProps) {
	const {
		basename,
		interfaceName: interfaceNameProp = 'default',
		interfaceOptions = [],
		searchString = '', setSearchString,
	} = props;
	const {
		// boolOnChange, setBoolOnChange,
		interfaceCollectionCount, // setInterfaceCollectionCount,
		interfaceDocumentCount, // setInterfaceDocumentCount,
		interfaceNameState, setInterfaceNameState,
		initializing,
		jsonModalState, setJsonModalState,
		handlePaginationChange,
		loading, // setLoading,
		page, setPage,
		perPage, // setPerPage,
		resultState,
		searchedStringState,
		searchFunction,
		start, // setStart,
	} = useSearchState({
		basename,
		fieldsProp: props.fields,
		interfaceNameProp,
		searchString,
		servicesBaseUrl: props.servicesBaseUrl,
		setBottomBarMessage: props.setBottomBarMessage,
		setBottomBarMessageHeader: props.setBottomBarMessageHeader,
		setBottomBarVisible: props.setBottomBarVisible,
	});
	// console.debug('interfaceCollectionCount', interfaceCollectionCount);
	// console.debug('interfaceDocumentCount', interfaceDocumentCount);
	const {
		// documentTypesAndFields = [],
		// collectionOptions = [],
		// firstColumnWidth = 2,
		// thesaurusOptions = []
	} = props;
	//console.debug('documentTypesAndFields', documentTypesAndFields);
	//const [synonyms, setSynonyms] = React.useState([]);

	// NOTE: If you hold a key down, onKeyDown and onKeyPress happens multiple times!
	return <Container>
		<Flex
			justifyContent='space-between'
			gap
			marginBottom
		>
			<Flex.Item
				flexGrow
			>
				<SearchInput
					disabled={!interfaceCollectionCount || !interfaceDocumentCount}
					fluid
					loading={false}
					onKeyUp={(event :{
						which :number
					}) => {
						//console.debug('onKeyUp event.which',event.which);
						if(event.which == 10 || event.which == 13) {
							//console.debug('onKeyUp searchString',searchString);
							setPage(1);
							// setStart(0);
							searchFunction({
								searchString,
								start: 0
							});
						}
					}}
					onChange={(
						_event,
						{value}
					) => {
						//console.debug('onChange value',value);
						setSearchString(value);
						// if (boolOnChange) {
						// 	search(value);
						// }
					}}
					value={searchString}
				/>
			</Flex.Item>
			{interfaceOptions.length
				? <>
					<Flex.Item>
						<Dropdown
							clearable
							onChange={(_event,{value}) => {
								if (!value) { value = 'default'; }
								setInterfaceNameState(value as string);
							}}
							options={interfaceOptions}
							placeholder='Default interface (all collections)'
							search
							selection
							value={interfaceNameState === 'default' ? undefined : interfaceNameState}
						/>
					</Flex.Item>
					<Flex.Item>
						<Link
							className='graphql'
							to={`/api?interfaceName=${interfaceNameState}`}
						>
							<svg version="2.0">
								<use href="#graphql100" />
							</svg>
						</Link>
					</Flex.Item>
				</>
				: null
			}
		</Flex>
		{initializing
			? null
			: interfaceCollectionCount
				? interfaceDocumentCount
					? <>
						{searchedStringState
							? <Segment basic>
								Searched {interfaceDocumentCount} documents
								across {interfaceCollectionCount} collections
								for <b>{searchedStringState}</b>
								<span> and found {resultState.total} matching documents.</span>
							</Segment>
							: loading
								? <Segment basic>Searching {interfaceDocumentCount} documents across {interfaceCollectionCount} collections...</Segment>
								: <Segment basic>Ready to search {interfaceDocumentCount} documents across {interfaceCollectionCount} collections.</Segment>
						}

						{searchedStringState && !resultState.total
							? <Segment basic className='c-lgr' size='massive' textAlign='center'>
								<Header as='h1' content='D&apos;oh!' size='huge' style={{
									marginBottom: 14
								}}/>
								No hits - better luck next time...
							</Segment>
							: null
						}
						{resultState.total ? <DocumentsTable
							documentsRes={resultState}
							dragAndDropColumnsProp={false}
							handlePaginationChange={handlePaginationChange}
							jsonModalState={jsonModalState}
							loading={loading}
							page={page}
							perPage={perPage}
							searchedString={searchedStringState}
							selectedColumnsState={[
								Column.JSON,
								Column.COLLECTION,
								Column.DOCUMENT_TYPE,
								...props.fields.map(({name}) => name)
							]}
							setJsonModalState={setJsonModalState}
							start={start}
						/> : null}
						{/*<Hits
							firstColumnWidth={firstColumnWidth}
							hits={result.hits}
							loading={loading}
						/>*/}
						{interfaceNameProp === 'default'
							? null
							: searchedStringState ? <Accordion
								locales={resultState.locales || []}
								profiling={resultState.profiling || []}
								synonyms={resultState.synonyms || []}
							/> : null
						}
					</>
					: interfaceNameProp === 'default'
						? 'No documents available, add some documents to a collection to get started.'
						: interfaceCollectionCount === 1
							? `There are no documents in the ${interfaceCollectionCount} collection of the ${interfaceNameProp} interface. Add some documents to it to get started.`
							: `There are no documents in any of the ${interfaceCollectionCount} collections of the ${interfaceNameProp} interface. Add some documents to any of them to get started.`
				: interfaceNameProp === 'default'
					? <Segment basic className='c-lgr' size='massive' textAlign='center'>
						<Header as='h1' content='D&apos;oh!' size='huge' style={{
							marginBottom: 14
						}}/>
						No collections available, <Link to='/collections/create'>create a collection</Link> to get started.
					</Segment>
					: `There are no collections in the ${interfaceNameProp} interface. Add collections to the interface to get started.`
		}
	</Container>;
} // function Search

/*

updateInterfaces() {
	this.setState({ isLoading: true });
	fetch(`${this.props.servicesBaseUrl}/interfaceList`)
		.then(response => response.json())
		.then(data => this.setState(prevState => {
			prevState.interfaceOptions = data.hits.map(({displayName: text, name: key}) => ({
				key,
				text,
				value: key
			}));
			if (prevState.interfaceName && !prevState.interfaceOptions.map(({key}) => key).includes(prevState.interfaceName)) {
				prevState.interfaceName = '';
			}
			if (!prevState.interfaceName && prevState.interfaceOptions.length) {
				prevState.interfaceName = prevState.interfaceOptions[0].key;
			}
			prevState.isLoading = false;
			return prevState;
		}));
} // updateInterfaces

<Dropdown
	fluid
	onChange={(ignored,{value}) => {
		//console.debug(value);
		this.setState({interfaceName: value});
	}}
	options={interfaceOptions}
	placeholder={interfaceOptions.length ? 'Please select an interface' : 'You must first configure an interface!'}
	search
	selection
	value={interfaceName}
/>

<Select
	label="Collections"
	multiple={true}
	name="collections"
	options={collectionOptions}
	value={collections}
/>

<Select
	label="Thesauri"
	multiple={true}
	name="thesauri"
	options={thesaurusOptions}
	value={thesauri}
/>

{synonyms ? <>
	<Header dividing text='Synonyms'/>
	<Table basic collapsing compact small very>
		<thead>
			<tr>
				<th>Thesaurus</th>
				<th>Score</th>
				<th>From</th>
				<th>To</th>
			</tr>
		</thead>
		<tbody>
			{Object.keys(synonyms).map((thesaurus, i) => Object.keys(synonyms[thesaurus]).map((from, j) => <tr className="middle aligned" key={`${i}.${j}`}>
				{j === 0 ? <td rowSpan={Object.keys(synonyms[thesaurus]).length}>{thesaurus}</td> : null}
				<td>{synonyms[thesaurus][from].score}</td>
				<td>{data.expand ? <Label basic mini text={from}/> : from}</td>
				<td><Labels mini>{forceArray(synonyms[thesaurus][from].to).map((t, k) => <Label basic key={k} text={t}/>)}</Labels></td>
			</tr>))}
		</tbody>
	</Table>
</> : null}

*/
