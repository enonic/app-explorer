import type {
	PaginationProps,
} from 'semantic-ui-react';
import type JsonModalState from '../components/modals/JsonModalState.d';
import type {QueryDocumentsResult} from './';


import {
	ELLIPSIS,
	getIn,
	isString,
} from '@enonic/js-utils';
import {FieldPath} from '@enonic/explorer-utils';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend'
import ReactHtmlParser from 'react-html-parser';
import {
	Button,
	Icon,
	Pagination,
	Table,
} from 'semantic-ui-react';
import JsonModal from '../components/modals/JsonModal';
import {
	FRAGMENT_SIZE_DEFAULT,
	PER_PAGE_DEFAULT,
	POST_TAG,
	PRE_TAG,
	SELECTED_COLUMNS_DEFAULT,
	Column,
} from './constants';
import DragAndDropableHeaderCell from './DragAndDropableHeaderCell';
import React from 'react';


function getHighlightedHtml({
	_highlight,
	fallback = '',
	fieldPath,
	fragmentSize,
}: {
	_highlight: Record<string,string[]>
	fallback: string
	fieldPath: string
	fragmentSize: number
}) {
	const lcFieldPath = fieldPath.toLowerCase();
	let highlightedHtml = _highlight[lcFieldPath]
		? _highlight[lcFieldPath][0]
		: _highlight[`${lcFieldPath}._stemmed_en`] // TODO Hardcode
			? _highlight[`${lcFieldPath}._stemmed_en`][0]
			: _highlight[`${lcFieldPath}._stemmed_no`]
				? _highlight[`${lcFieldPath}._stemmed_no`][0]
				: isString(fallback)
					? fallback.length > fragmentSize
						? `${fallback.substring(0, fragmentSize)}${ELLIPSIS}`
						: fallback
					: fallback;
	const strippedHighlight = highlightedHtml.replace(new RegExp(PRE_TAG,'g'), '').replace(new RegExp(POST_TAG,'g'), '');
	if (
		strippedHighlight !== fallback
	) {
		const startOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(0, strippedHighlight.length);
		const endOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(fallback.length - strippedHighlight.length);
		// console.debug({
		// 	fallback,
		// 	'fallback.length': fallback.length,
		// 	fragmentSize,
		// 	highlightedHtml,
		// 	strippedHighlight,
		// 	'strippedHighlight.length': strippedHighlight.length,
		// 	startOfFieldWithSameLengthAsStrippedHighlight,
		// 	endOfFieldWithSameLengthAsStrippedHighlight,
		// });
		if (strippedHighlight === startOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${highlightedHtml}${ELLIPSIS}`;
		} else if (strippedHighlight === endOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}`;
		} else {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}${ELLIPSIS}`;
		}
	}
	return highlightedHtml;
}

function columnNameToDisplayName(columnName: string) {
	return columnName === Column.COLLECTION
		? 'Collection'
		: columnName === Column.DOCUMENT_TYPE
			? 'Document type'
			: columnName === Column.LANGUAGE
				? 'Language'
				: columnName === Column.ID
					? 'Document ID'
					: columnName === Column.JSON
						? 'Document'
						: columnName;
}


function DocumentsTable({
	documentsRes,
	dragAndDropColumnsProp = false,
	fragmentSize = FRAGMENT_SIZE_DEFAULT,
	handleDroppedColumn = ({}) => undefined,
	handlePaginationChange,
	jsonModalState,
	loading,
	page,
	perPage = PER_PAGE_DEFAULT,
	searchedString,
	selectedColumnsState = [...SELECTED_COLUMNS_DEFAULT],
	setJsonModalState,
	start,
}: {
	documentsRes: QueryDocumentsResult,
	dragAndDropColumnsProp?: boolean,
	fragmentSize?: number
	handleDroppedColumn?: ({fromId, toId}: {fromId: string, toId: string}) => void
	handlePaginationChange: (
		_event: React.MouseEvent<HTMLAnchorElement>,
		data: PaginationProps
	) => void,
	jsonModalState: JsonModalState
	loading: boolean
	page: number
	perPage?: number
	searchedString: string
	selectedColumnsState?: string[]
	setJsonModalState: React.Dispatch<React.SetStateAction<JsonModalState>>
	start: number
}) {
	return <>
		<DndProvider backend={HTML5Backend}>
			<div className='ovx-o'>
				<Table celled compact striped>
					<Table.Header>
						<Table.Row>
							{dragAndDropColumnsProp
								? selectedColumnsState.map((columnName, i) => <DragAndDropableHeaderCell
									collapsing
									content={columnNameToDisplayName(columnName)}
									id={columnName}
									index={i}
									key={`column-${columnName}`}
									onDrop={({
										fromId,
										toId
									}) => handleDroppedColumn({
										fromId,
										toId
									})}
								/>)
								: selectedColumnsState.map((columnName, i) => <Table.HeaderCell
									content={columnNameToDisplayName(columnName)}
									key={i}
								/>)
							}
							{/*columnOptions
								.filter(({value}) => selectedColumns.includes(value as string))
								.map(({text},i) => <Table.HeaderCell collapsing content={text} key={i}/>)*/}
							{searchedString ? <Table.HeaderCell collapsing content='_allText'/> : null}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{documentsRes.hits.map(({
							_highlight = {},
							_id,
							// _json,
							parsedJson,
							...rest
						}, i) => {
							return <Table.Row key={i}>
								{
									selectedColumnsState.map((selectedColumnName, j) => {
										const key = `${i}.${j}`;
										if (selectedColumnName === Column.COLLECTION) {
											return <Table.Cell collapsing key={key}>
												{rest[FieldPath.META] && rest[FieldPath.META].collection || rest['_collection']}
											</Table.Cell>;
										} else if (selectedColumnName === Column.DOCUMENT_TYPE) {
											return <Table.Cell collapsing key={key}>
												{rest[FieldPath.META] && rest[FieldPath.META].documentType || rest['_documentType']}
											</Table.Cell>;
										} else if (selectedColumnName === Column.LANGUAGE) {
											return <Table.Cell collapsing key={key}>
												{rest[FieldPath.META] && rest[FieldPath.META].language || rest['_language']}
											</Table.Cell>;
										} else if (selectedColumnName === Column.ID) {
											return <Table.Cell collapsing key={key}>{_id}</Table.Cell>;
										} else if (selectedColumnName === Column.JSON) {
											return <Table.Cell collapsing key={key}>
												<Button
													icon='code'
													onClick={() => {
														setJsonModalState({
															open: true,
															header: _id,
															parsedJson: parsedJson || rest['_json'],
														})
													}}
												/>
											</Table.Cell>;
										} else if (!SELECTED_COLUMNS_DEFAULT.includes(selectedColumnName as Column)) {
											const htmlString = getHighlightedHtml({
												_highlight,
												fallback: getIn(parsedJson, selectedColumnName),
												fieldPath: selectedColumnName,
												fragmentSize,
											});
											// console.debug('htmlString', htmlString);
											return <Table.Cell
												collapsing
												key={key}
											>{ReactHtmlParser(htmlString)}</Table.Cell>;
										} else {
											console.error('Unhandeled selectedColumnName', selectedColumnName);
											return <Table.Cell
												collapsing
												key={key}
											/>;
										}
									})
									// .filter(x => x) // Overcome error, not needed and can cause scewed index between headerCell and cell
								}
								{searchedString ? <Table.Cell collapsing>
									{_highlight['_alltext'] && _highlight['_alltext'].length
										? <ul style={{
											listStyleType: 'none',
											margin: 0,
											padding: 0
										}}>
											{_highlight['_alltext'].map((htmlString, j) => <li key={j}>
												{ReactHtmlParser(htmlString)}
											</li>)}
										</ul>
										: null}
								</Table.Cell> : null}
							</Table.Row>})}
					</Table.Body>
				</Table>
			</div>
		</DndProvider>
		<Pagination
			disabled={loading || !documentsRes.total}
			pointing
			secondary
			size='mini'
			style={{
				marginBottom: 14,
				marginTop: 14
			}}

			activePage={page}
			boundaryRange={1}
			siblingRange={1}
			totalPages={Math.ceil(documentsRes.total / perPage)}

			ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
			firstItem={{content: <Icon name='angle double left' />, icon: true}}
			prevItem={{content: <Icon name='angle left' />, icon: true}}
			nextItem={{content: <Icon name='angle right' />, icon: true}}
			lastItem={{content: <Icon name='angle double right' />, icon: true}}

			onPageChange={handlePaginationChange}
		/>
		{documentsRes.total
			? <p className={loading ? 'disabled' : ''}>Displaying {(() => {
				const begin = start + 1;
				const end = Math.min(start + perPage, documentsRes.total);
				if (end === begin) {
					return begin;
				}
				return `${begin}-${end} of ${documentsRes.total}`;
			})()}</p>
			: null
		}
		<JsonModal
			state={jsonModalState}
			setState={setJsonModalState}
		/>
	</>;
}

export default DocumentsTable;
