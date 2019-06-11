import classNames from 'classnames';


export const Table = ({
	children,
	className,
	basic = false,
	celled = false,
	collapsing = false,

	very = false,
	compact = false,

	selectable = false,
	small = false,
	sortable = false,
	striped = false,
	...rest
}) => <table className={classNames(className, {
	basic,
	celled,
	collapsing,

	very,
	compact,

	selectable,
	small,
	sortable,
	striped
}, 'table ui')} {...rest}>{children}</table>;
