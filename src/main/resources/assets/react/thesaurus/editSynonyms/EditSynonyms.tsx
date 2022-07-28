import type {PaginationProps} from 'semantic-ui-react';
import type {SynonymLanguage} from '/lib/explorer/types/Synonym';
import type {Locales} from '../../index.d';


import {
	//Button,
	Dropdown, Form, Header, Icon, Loader, Pagination, Table
} from 'semantic-ui-react';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {NewOrEditSynonym} from '../newOrEditSynonym/index';
import {DeleteSynonym} from '../DeleteSynonym';
import {useEditSynonymsState} from './useEditSynonymsState';


export function EditSynonyms({
	// Required
	locales,
	servicesBaseUrl,
	// Optional
	thesaurusId,
	thesaurusName
} :{
	// Required
	locales :Locales
	servicesBaseUrl :string
	// Optional
	thesaurusId ?:string
	thesaurusName ?:string
}) {
	const {
		aggregations,
		column,
		direction,
		end,
		from,
		isLoading,
		languages,
		memoizedQuerySynonyms,
		page,
		perPage,
		result,
		setFrom,
		setLanguages,
		setPage,
		setPerPage,
		setThesauri,
		setTo,
		sortAfterColumnClick,
		start,
		thesauri,
		to,
		total,
		totalPages
	} = useEditSynonymsState({
		servicesBaseUrl,
		thesaurusName
	});
	return <>
		<Form>
			<Header as='h4'><Icon name='filter'/> Filter</Header>
			<Form.Field>
				<LanguageDropdown
					clearable={true}
					disabled={isLoading}
					includeANoneOption={false}
					language={languages}
					loading={isLoading}
					locales={locales}
					multiple={true}
					setLanguage={(newLanguages) => setLanguages(newLanguages as Array<string>)}
				/>
			</Form.Field>
			<Form.Field>
				<Form.Input
					fluid={true}
					label='From'
					onChange={({target:{value}}) => setFrom(value)}
					placeholder='From'
					value={from}
				/>
			</Form.Field>
			<Form.Field>
				<Form.Input
					fluid={true}
					label='To'
					onChange={({target:{value}}) => setTo(value)}
					placeholder='To'
					value={to}
				/>
			</Form.Field>

			{thesaurusId ? null : <>
				<Header as='h4'><Icon name='font'/> Thesauri</Header>
				<Dropdown
					defaultValue={thesauri}
					fluid
					multiple={true}
					name='thesauri'
					onChange={(
						//@ts-ignore
						event :unknown,
						{
							value
						} :{
							value :Array<string>
						}
					) => setThesauri(value)}
					options={aggregations.thesaurus.buckets.map(({key, docCount}) => {
						const tName = key.replace('/thesauri/', '');
						return {
							key: tName,
							text: `${tName} (${docCount})`,
							value: tName
						};
					})}
					search
					selection
				/>
			</>}

			<Header as='h4'><Icon name='resize vertical'/> Per page</Header>
			<Form.Field>
				<Dropdown
					defaultValue={perPage}
					fluid
					onChange={(
						//@ts-ignore
						event :unknown,
						{
							value
						} :{
							value :number
						}
					) => setPerPage(value)}
					options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
					selection
				/>
			</Form.Field>

			{/*<Header as='h4'><Icon name='sort'/> Sort</Header>
			<Form.Field>
				<Dropdown
					defaultValue={sort}
					fluid
					onChange={(e,{value}) => querySynonyms({sort: value})}
					options={[{
						key: '_score DESC',
						text: 'Score descending',
						value: '_score DESC'
					}, {
						key: 'from ASC',
						text: 'From ascending',
						value: 'from ASC'
					}]}
					selection
				/>
			</Form.Field>*/}
		</Form>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <>
				<Table celled compact selectable sortable striped attached='top'>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Edit</Table.HeaderCell>
							<Table.HeaderCell
								onClick={() => sortAfterColumnClick('from', column, direction)}
								sorted={column === 'from' ? direction : null}
							>From</Table.HeaderCell>
							<Table.HeaderCell
								onClick={() => sortAfterColumnClick('to', column, direction)}
								sorted={column === 'to' ? direction : null}
							>To</Table.HeaderCell>
							<Table.HeaderCell
								onClick={() => sortAfterColumnClick('both', column, direction)}
								sorted={column === 'both' ? direction : null}
							>Both</Table.HeaderCell>
							{thesaurusId ? null : <Table.HeaderCell
								onClick={() => sortAfterColumnClick('_parentPath', column, direction)}
								sorted={column === '_parentPath' ? direction : null}
							>Thesaurus</Table.HeaderCell>}
							<Table.HeaderCell
								onClick={() => sortAfterColumnClick('_score', column, direction)}
								sorted={column === '_score' ? direction : null}
							>Score</Table.HeaderCell>
							<Table.HeaderCell>Delete</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{result.hits.map(({
							_id,
							//name,
							_score,
							languages: languagesArray,
							thesaurus,
							thesaurusReference,
						}, i :number) => {
							const synonymsObj = {
								both: [],
								from: [],
								to: []
							};
							for (let i = 0; i < (languagesArray as unknown as Array<SynonymLanguage & {locale :string}>).length; i++) {
							    const {
									locale,
									synonyms
								} = languagesArray[i] as SynonymLanguage & {locale :string};
								for (let j = 0; j < synonyms.length; j++) {
								    const {
										synonym,
										use// = 'to'
									} = synonyms[j];
									const str = `${synonym} (${locale})`;
									if (!synonymsObj[use].includes(str)) {
										synonymsObj[use].push(str);
									}
								}
							} // for languagesArray
							console.debug('synonymsObj', synonymsObj);
							return <Table.Row key={i}>
								<Table.Cell collapsing><NewOrEditSynonym
									_id={_id}
									afterClose={memoizedQuerySynonyms}
									servicesBaseUrl={servicesBaseUrl}
									thesaurusId={thesaurusReference}
								/></Table.Cell>
								<Table.Cell>{synonymsObj.from.join(', ')}</Table.Cell>
								<Table.Cell>{synonymsObj.to.join(', ')}</Table.Cell>
								<Table.Cell>{synonymsObj.both.join(', ')}</Table.Cell>
								{thesaurusId ? null : <Table.Cell>{thesaurus}</Table.Cell>}
								<Table.Cell>{_score}</Table.Cell>
								<Table.Cell collapsing>
									<DeleteSynonym
										_id={_id}
										from={synonymsObj.from}
										afterClose={memoizedQuerySynonyms}
										servicesBaseUrl={servicesBaseUrl}
										to={synonymsObj.to}
									/>
								</Table.Cell>
							</Table.Row>})}
					</Table.Body>
				</Table>
				<Pagination
					attached='bottom'
					fluid
					size='mini'

					activePage={page}
					boundaryRange={1}
					siblingRange={1}
					totalPages={totalPages}

					ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
					firstItem={{content: <Icon name='angle double left' />, icon: true}}
					prevItem={{content: <Icon name='angle left' />, icon: true}}
					nextItem={{content: <Icon name='angle right' />, icon: true}}
					lastItem={{content: <Icon name='angle double right' />, icon: true}}

					onPageChange={(
						//@ts-ignore
						event :unknown,
						{
							activePage
						} :PaginationProps
					) => setPage(activePage)}
				/>
				<p>Displaying {start}-{end} of {total}</p>
				{thesaurusId && <NewOrEditSynonym
					afterClose={memoizedQuerySynonyms}
					servicesBaseUrl={servicesBaseUrl}
					thesaurusId={thesaurusId}
				/>}
			</>
		}
	</>;
} // EditSynonyms
