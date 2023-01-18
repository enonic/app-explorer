import cx from 'clsx'

export const CSS_JUSTIFY_CONTENT_VALUES_ABBR = {
	// Global values https://developer.mozilla.org/en-US/docs/Web/CSS/all
	ini: 'initial',
	ih:  'inherit',
	u:   'unset',
	rv:  'revert',
	// Align-content https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#Values
	b:  'baseline',
	c:  'center',
	e:  'end',
	fe: 'flex-end',
	//first baseline
	fs: 'flex-start',
	//last baseline
	l:  'left',
	n:  'normal',
	r:  'right',
	//safe center
	sa: 'space-around',
	sb: 'space-between',
	se: 'space-evenly',
	s:  'start',
	st: 'stretch'
	//unsafe center
}; // CSS_JUSTIFY_CONTENT_VALUES_ABBR

const JUSTIFY_CONTENT_VALUE_TO_ABBR = {};
const justifyContentAbbrs = Object.keys(CSS_JUSTIFY_CONTENT_VALUES_ABBR);
for (let i = 0; i < justifyContentAbbrs.length; i++) {
	const k = justifyContentAbbrs[i];
	JUSTIFY_CONTENT_VALUE_TO_ABBR[CSS_JUSTIFY_CONTENT_VALUES_ABBR[k]] = k;
}

export const CSS_OVERFLOW_VALUES_ABBR = {
	// Global values https://developer.mozilla.org/en-US/docs/Web/CSS/all
	i: 'initial',
	n: 'inherit',
	u: 'unset',
	r: 'revert',
	// Overflow https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#Values
	a: 'auto',
	h: 'hidden',
	o: 'overlay',
	s: 'scroll',
	v: 'visible'
	//clip
};

const OVERFLOW_VALUE_TO_ABBR = {};
const overFlowAbbrs = Object.keys(CSS_OVERFLOW_VALUES_ABBR);
for (let i = 0; i < overFlowAbbrs.length; i++) {
	const k = overFlowAbbrs[i];
	OVERFLOW_VALUE_TO_ABBR[CSS_OVERFLOW_VALUES_ABBR[k]] = k;
}

function Flex({
	children,
	className,
	justifyContent,
	gap,
	marginBottom,
	...rest
}: {
	children: any
	className?: string
	justifyContent: 'center'|'flex-start'|'space-between' // React.CSSProperties['justifyContent']
	gap?: true, // 'normal'|number|``,React.CSSProperties['gap']
	marginBottom?: true,
	style?: React.CSSProperties
}) {
	const classesArray = [
		'd-f'
	];
	if (justifyContent) {
		classesArray.push(`jc-${JUSTIFY_CONTENT_VALUE_TO_ABBR[justifyContent]}`);
	}
	if (gap === true) {
		classesArray.push('g-1rem');
	}
	if (marginBottom === true) {
		classesArray.push('mb-1rem');
	}
	classesArray.push(className);
	const classes = cx(...classesArray);
	return (
		<div {...rest} className={classes}>
			{children}
		</div>
	)
}

function Item({
	children,
	className,
	flexGrow,
	overflowX,
	overflowY,
	...rest
}: {
	children: any
	className?: string
	flexGrow?: boolean|1
	overflowX?: boolean|'hidden'|'overlay'|'visible' // | React.CSSProperties['overflowX']
	overflowY?: boolean|'hidden'|'visible' // | React.CSSProperties['overflowY']
	style?: React.CSSProperties
}) {
	const classesArray = [];

	if (flexGrow === true) {
		flexGrow = 1
	}
	if (flexGrow) {
		classesArray.push(`fx-g-${flexGrow}`);
	}

	if (overflowX === true) {
		overflowX = 'visible';
	} else if (overflowX === false) {
		overflowX = 'hidden';
	}
	if (overflowX) {
		classesArray.push(`ovx-${OVERFLOW_VALUE_TO_ABBR[overflowX]}`);
	}

	if (overflowY === true) {
		overflowY = 'visible';
	} else if (overflowY === false) {
		overflowY = 'hidden';
	}
	if (overflowY) {
		classesArray.push(`ovy-${OVERFLOW_VALUE_TO_ABBR[overflowY]}`);
	}

	classesArray.push(className);
	const classes = cx(...classesArray);

	return (
		<div {...rest} className={classes}>
			{children}
		</div>
	)
}

Flex.Item = Item;

export default Flex
