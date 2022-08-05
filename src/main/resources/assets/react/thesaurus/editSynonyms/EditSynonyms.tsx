import type {PaginationProps} from 'semantic-ui-react';
import type {Locales} from '../../index.d';


import ReactHtmlParser from 'react-html-parser';
import {
	//Button,
	Dropdown,
	Form, Header, Icon, List, Loader, Message, Pagination, Table
} from 'semantic-ui-react';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {NewOrEditSynonym} from '../newOrEditSynonym/index';
import {DeleteSynonym} from '../DeleteSynonym';
import {processLanguages} from './processLanguages';
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
		<Header as='h4'><Icon name='search'/> Query</Header>
		<Form>
			<Form.Group widths='equal'>
				<Form.Input
					fluid={true}
					label='From'
					onChange={({target:{value}}) => setFrom(value)}
					placeholder='From'
					value={from}
				/>
				<Form.Input
					fluid={true}
					label='To'
					onChange={({target:{value}}) => setTo(value)}
					placeholder='To'
					value={to}
				/>
				{/*
				<Form.Input
					fluid={true}
					label='Both'
					onChange={({target:{value}}) => setTo(value)}
					placeholder='Both'
					value={both}
				/>
				*/}
			</Form.Group>
		</Form>

		<Header as='h4'><Icon name='filter'/> Filters</Header>
		<Form>
			<Form.Field>
				<label>Languages</label>
				<LanguageDropdown
					clearable={true}
					disabled={isLoading}
					includeANoneOption={false}
					language={languages}
					loading={isLoading}
					locales={locales}
					multiple={true}
					placeholder='Select languages'
					setLanguage={(newLanguages) => setLanguages(newLanguages as Array<string>)}
				/>
			</Form.Field>
		</Form>

		{thesaurusId ? null : <>
			{/*<Header as='h4'><Icon name='font'/> Thesauri</Header>*/}
			<Form>
				<Form.Field>
					<label>Thesauri</label>
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
				</Form.Field>
			</Form>
		</>}

		<Header as='h4'><Icon name='resize vertical'/> Per page</Header>
		<Form>
			<Form.Dropdown
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
		</Form>

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
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <>
				<Table celled compact selectable sortable striped attached='top'>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Edit</Table.HeaderCell>
							<Table.HeaderCell>From</Table.HeaderCell>
							<Table.HeaderCell>To</Table.HeaderCell>
							<Table.HeaderCell>Both</Table.HeaderCell>
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
							_highlight,
							_id,
							//_name,
							_nodeTypeVersion,
							_score,
							languages: languagesArray,
							thesaurus,
							thesaurusReference,
						}, i :number) => {
							//console.debug(_highlight, _highlight);
							const synonymsObj = processLanguages({
								_highlight,
								languagesArray,
								localeToStemmingLanguage: result.localeToStemmingLanguage
							});
							//console.debug('synonymsObj', synonymsObj);
							return <Table.Row key={i}>
								<Table.Cell collapsing><NewOrEditSynonym
									_id={_id}
									afterClose={memoizedQuerySynonyms}
									servicesBaseUrl={servicesBaseUrl}
									thesaurusId={thesaurusReference}
								/></Table.Cell>
								<Table.Cell>{
									_nodeTypeVersion && _nodeTypeVersion > 1
										? <List>{synonymsObj.from.map((item, j) => <List.Item key={j}>{ReactHtmlParser(item)}</List.Item>)}</List>
										: <Message content='Needs migration' negative/>
								}</Table.Cell>
								<Table.Cell>{
									_nodeTypeVersion && _nodeTypeVersion > 1
										?<List>{synonymsObj.to.map((item, j) => <List.Item key={j}>{ReactHtmlParser(item)}</List.Item>)}</List>
										: <Message content='Needs migration' negative/>
								}</Table.Cell>
								<Table.Cell>{
									_nodeTypeVersion && _nodeTypeVersion > 1
										?<List>{synonymsObj.both.map((item, j) => <List.Item key={j}>{ReactHtmlParser(item)}</List.Item>)}</List>
										: <Message content='Needs migration' negative/>
								}</Table.Cell>
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
