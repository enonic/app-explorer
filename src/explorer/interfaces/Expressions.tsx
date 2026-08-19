import type { InterfaceExpressions } from '@enonic-types/lib-explorer/Interface.d';
import {
	Checkbox,
	Header,
	Input,
	Table,
	TableHeader,
	TableHeaderCell,
	TableBody,
	TableRow,
	TableCell,
} from 'semantic-ui-react';

import * as React from 'react';


export default function Expressions({
	disabled,
	expressions,
	setExpressions
}: {
	disabled: boolean;
	expressions: InterfaceExpressions;
	setExpressions: React.Dispatch<React.SetStateAction<InterfaceExpressions>>
}): React.JSX.Element {
	const fulltextBoost = expressions?.fulltext?.boost ?? 1;
	const fulltextEnabled = !expressions?.fulltext?.disabled;
	const stemmedBoost = expressions?.stemmed?.boost ?? 0.9;
	const stemmedEnabled = !expressions?.stemmed?.disabled;
	const nGramBoost = expressions?.nGram?.boost ?? 0.8;
	const nGramEnabled = !expressions?.nGram?.disabled;
	return (<>
		<Header
			as='h2'
			content='Expression(s)'
			dividing
			id='expressions'
			size='medium'
		/>
		<Table>
			<TableHeader>
				<TableRow>
					<TableHeaderCell>Expression</TableHeaderCell>
					<TableHeaderCell>Boost</TableHeaderCell>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>
						<Checkbox
							checked={fulltextEnabled}
							disabled={disabled}
							label='fulltext'
							onChange={(_e, {checked}) => setExpressions((prev) => {
								const newExpressions = JSON.parse(JSON.stringify(prev||{}));
								if (!newExpressions.fulltext) newExpressions.fulltext = {};
								newExpressions.fulltext.disabled = !checked;
								return newExpressions;
							})}
						/>
					</TableCell>
					<TableCell>
						<Input
							disabled={disabled}
							fluid
							min={0}
							onChange={(_e,{ value: newBoost }) => setExpressions((prev) => {
								const newExpressions = JSON.parse(JSON.stringify(prev||{}));
								if (!newExpressions.fulltext) newExpressions.fulltext = {};
								newExpressions.fulltext.boost = parseFloat(newBoost);
								return newExpressions;
							})}
							step={0.01}
							type='number'
							value={fulltextBoost}
						/>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						<Checkbox
							checked={stemmedEnabled}
							disabled={disabled}
							label='stemmed'
							onChange={(_e, {checked}) => setExpressions((prev) => {
								const newExpressions = JSON.parse(JSON.stringify(prev||{}));
								if (!newExpressions.stemmed) newExpressions.stemmed = {};
								newExpressions.stemmed.disabled = !checked;
								return newExpressions;
							})}
						/>
					</TableCell>
					<TableCell>
						<Input
							disabled={disabled}
							fluid
							min={0}
							onChange={(_e,{value:newBoost}) => setExpressions((prev) => {
								const newExpressions = JSON.parse(JSON.stringify(prev||{}));
								if (!newExpressions.stemmed) newExpressions.stemmed = {};
								newExpressions.stemmed.boost = parseFloat(newBoost);
								return newExpressions;
							})}
							step={0.01}
							type='number'
							value={stemmedBoost}
						/>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						<Checkbox
							checked={nGramEnabled}
							disabled={disabled}
							label='nGram'
							onChange={(_e, {checked}) => setExpressions((prev) => {
								const newExpressions = JSON.parse(JSON.stringify(prev||{}));
								if (!newExpressions.nGram) newExpressions.nGram = {};
								newExpressions.nGram.disabled = !checked;
								return newExpressions;
							})}
						/>
					</TableCell>
					<TableCell>
						<Input
							disabled={disabled}
							fluid
							min={0}
							onChange={(_e,{value:newBoost}) => setExpressions((prev) => {
								const newExpressions = JSON.parse(JSON.stringify(prev||{}));
								if (!newExpressions.nGram) newExpressions.nGram = {};
								newExpressions.nGram.boost = parseFloat(newBoost);
								console.debug('setExpressions nGram.boost', newExpressions);
								return newExpressions;
							})}
							step={0.01}
							type='number'
							value={nGramBoost}
						/>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</>);
}
