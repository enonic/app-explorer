import classNames from 'classnames';

export const Span = ({
	color = '',
	children,
	disabled,
	...rest
}) => <span className={classNames(
	'ui text',
	`${color}`,
	disabled === true ? 'disabled' : undefined
)} {...rest}>{children}</span>;
