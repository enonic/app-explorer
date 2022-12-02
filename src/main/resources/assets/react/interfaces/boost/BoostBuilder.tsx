import type {BoostDSL} from '../useNewOrEditInterfaceState';


import {
	Button,
} from 'semantic-ui-react';


export function BoostBuilder({
	boost,
	setBoost,
}: {
	boost: BoostDSL[]
	setBoost: React.Dispatch<React.SetStateAction<BoostDSL[]>>
}) {
	console.debug('boost', boost);
	return <>
		<Button
			content='Term'
			icon={{
				color: 'green',
				name: 'plus'
			}}
			onClick={()=>{setBoost(prev => {
				prev.push({
					term: {
						boost: 1,
						field: '',
						// type:,
						value: undefined
					}
				});
				return prev;
			})}}
		/>
		<Button
			content='In'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='Like'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='Range'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='PathMatch'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='Exists'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
	</>;
}
