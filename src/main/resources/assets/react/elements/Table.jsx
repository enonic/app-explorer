import classNames from 'classnames';


export const Table = ({
	children,
	className,
	headers = [],
	thStyle,
	...rest
}) => <table
	className={classNames('compact', 'ui', 'selectable', 'celled', 'striped', 'table', className)}
	{...rest}
>
	{headers.length ? <thead>
		<tr>{headers.map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr>
	</thead> : null}
	<tbody>{children}</tbody>
</table>;
