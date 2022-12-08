import type {
	DropdownItemProps,
	TRANSITION_STATUSES as TransitionStatuses,
} from 'semantic-ui-react';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';


import {isSet} from '@enonic/js-utils';
import * as React from 'react';
import {
	Header,
	Segment,
	Transition,
} from 'semantic-ui-react';
import {FieldSelector} from './FieldSelector';


const DURATION_SEGMENT_HIDE = 250;
const DURATION_SEGMENT_SHOW = 500;


export function Fields({
	fieldOptions,
	fields,
	isDefaultInterface,
	isLoading,
	setFieldButtonVisible,
	setFields,
}: {
	fieldOptions: DropdownItemProps[]
	fields: InterfaceField[]
	isDefaultInterface: boolean
	isLoading: boolean
	setFields: React.Dispatch<React.SetStateAction<InterfaceField[]>>
	setFieldButtonVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
	return <Transition
		animation='fade down'
		duration={{
			hide: DURATION_SEGMENT_HIDE,
			show: DURATION_SEGMENT_SHOW
		}}
		onStart={(_null,{status} :{status: TransitionStatuses}) => {
			// console.debug('segment onStart', status);
			if (status === 'EXITING') {
				setTimeout(() => {
					setFieldButtonVisible(true);
				}, DURATION_SEGMENT_HIDE);
			}
		}}
		visible={isSet(fields) ? !!fields.length : false}
	>
		<Segment basic style={{padding: 0}}>
			<Header
				as='h4'
				content='Fields'
				disabled={isLoading || isDefaultInterface}
				dividing
				id='fields'
				size='small'
			/>
			<FieldSelector
				disabled={isLoading || isDefaultInterface}
				fieldOptions={fieldOptions}
				setFields={setFields}
				value={fields}
			/>
		</Segment>
	</Transition>;
}
