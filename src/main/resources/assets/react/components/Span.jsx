import classNames from 'classnames';

export const Span = ({
	color = '',
	children,
	...rest
}) => <span className={classNames('ui text', `${color}`)} {...rest}>{children}</span>;
