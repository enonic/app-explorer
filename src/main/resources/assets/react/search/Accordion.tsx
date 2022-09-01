import type {
	Profiling,
	Synonyms
} from './index.d';


import {
	Accordion as SURAccordion,
	Table
} from 'semantic-ui-react';
import {TypedReactJson} from './TypedReactJson';


export function Accordion({
	locales = [],
	profiling = [],
	synonyms = []
} :{
	locales :Array<string>
	profiling :Array<Profiling>
	synonyms :Synonyms
}) {
	const panels = [{
		key: 0,
		title: 'Locales',
		content: locales.sort().join(', ')
	}, {
		key: 1,
		title: 'Profiling',
		content: {
			content: (
				<Table compact>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell content='Group'/>
							<Table.HeaderCell content='Operation'/>
							<Table.HeaderCell content='Duration Operation' textAlign='right'/>
							<Table.HeaderCell content='Duration Group' textAlign='right'/>
							<Table.HeaderCell content='Duration Total' textAlign='right'/>
						</Table.Row>
					</Table.Header>
					<Table.Body>
					{
						profiling.map(({
							durationMs,
							durationSinceLocalStartMs,
							durationSinceTotalStartMs,
							label,
							operation
						}, i) => <Table.Row key={i}>
							<Table.Cell content={label}/>
							<Table.Cell content={operation}/>
							<Table.Cell content={durationMs} textAlign='right'/>
							<Table.Cell content={durationSinceLocalStartMs} textAlign='right'/>
							<Table.Cell content={durationSinceTotalStartMs} textAlign='right'/>
						</Table.Row>)
					}
					</Table.Body>
				</Table>
			)
		}
	},{
		key: 2,
		title: 'Synonyms',
		content: {
			content: (
				<Table compact>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell content='Thesaurus'/>
							<Table.HeaderCell content='Score'/>
							<Table.HeaderCell content='Highlight'/>
							<Table.HeaderCell content='Synonyms'/>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{
							synonyms.map(({
								_highlight = {},
								_score,
								synonyms = [],
								thesaurusName
							}, i) => <Table.Row key={i}>
								<Table.Cell content={thesaurusName}/>
								<Table.Cell content={_score}/>
								<Table.Cell><TypedReactJson
									enableClipboard={false}
									displayArrayKey={false}
									displayDataTypes={false}
									displayObjectSize={false}
									indentWidth={2}
									name={null}
									quotesOnKeys={false}
									sortKeys={true}
									src={_highlight}
								/></Table.Cell>
								<Table.Cell><TypedReactJson
									enableClipboard={false}
									displayArrayKey={false}
									displayDataTypes={false}
									displayObjectSize={false}
									indentWidth={2}
									name={null}
									quotesOnKeys={false}
									sortKeys={true}
									src={synonyms}
								/></Table.Cell>
							</Table.Row>)
						}
					</Table.Body>
				</Table>
			)
		}
	}];
	return <SURAccordion
		defaultActiveIndex={[]}
		fluid
		panels={panels}
		styled
	/>;
}
