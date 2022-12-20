import type {
	StrictTableHeaderCellProps,
	// TableHeaderCellProps,
} from 'semantic-ui-react';


interface Item {
	id: string
}


import {useDrag, useDrop} from 'react-dnd';
import {
	// Ref, // Deprecated
	Table
} from 'semantic-ui-react';
import Ref from '@semantic-ui-react/component-ref';
// import {childrenUtils} from 'semantic-ui-react/src/lib'; // You may need an appropriate loader to handle this file type
import {childrenUtils} from 'semantic-ui-react/dist/commonjs/lib';


function Overlay({color}: {color: string}) {
	return <div
		style={{
			position: 'absolute',
			top: 0,
			left: 0,
			height: '100%',
			width: '100%',
			zIndex: 1,
			opacity: 0.2,
			backgroundColor: color,
		}}
	/>;
}

export default function DragAndDropableHeaderCell(
	props: StrictTableHeaderCellProps & {
		id: string
		index: number
		onDrop: ({
			fromId,
			toId
		}: {
			fromId: string
			toId: string
		}) => void
		style?: React.CSSProperties // "missing" from StrictTableHeaderCellProps
	}
) {
	const {
		children,
		content,
		id: idProp,
		onDrop = () => {/* default no-op dummy just in case */},
		style = {},
		...tableHeaderCellPropsExceptChildrenOrContentOrStyle
	} = props;

	const [dragProps, drag, dragPreview] = useDrag<Item, unknown, {
		isDragging: boolean
	}>(() => ({
		type: 'HeaderCell',
		// canDrag: (monitor)=> {
		// 	console.debug('on canDrag monitor', monitor);
		// 	return true;
		// },
		collect: monitor => ({
			isDragging: !!monitor.isDragging(),
		}),
		// end: (item, monitor) => {
		// 	console.debug('on drag end item', item, 'monitor', monitor);
		// },
		// isDragging: (monitor) => {
		// 	console.debug('on isDragging monitor', monitor);
		// 	return true;
		// },
		item: {
			id: idProp,
		},
		// options: {
		// 	dropEffect: 'copy',
		// 	// dropEffect: 'move',
		// },
		// previewOptions: {
		// 	anchorX: 0,
		// 	anchorY: 0,
		// 	captureDraggingState: true,
		// 	offsetX: 0,
		// 	offsetY: 0,
		// },
	}),
	// A dependency array used for memoization.
	// This behaves like the built-in useMemoReact hook.
	// The default value is an empty array for function spec,
	// and an array containing the spec for an object spec.
	// []
	);
	// console.debug('dragProps', dragProps);
	const { isDragging } = dragProps;

	const [dropProps, drop] = useDrop<Item, unknown, {
		canDrop: boolean,
		isOver: boolean
	}>(
		() => ({
			accept: 'HeaderCell',
			canDrop: (item/*, monitor*/) => {
				// console.debug('on canDrop item', item, 'idProp', idProp);
				// console.debug('on canDrop monitor', monitor);
				const {
					id,
				} = item;
				return id !== idProp;
			},
			drop: (item/*, monitor*/) => {
				// console.debug('on drop item', item, 'idProp', idProp);
				// console.debug('on drop monitor', monitor);
				const {
					id,
				} = item; // The dropped item
				onDrop({
					fromId: id,
					toId: idProp
				});
			},
			collect: (monitor) => ({
				canDrop: !!monitor.canDrop(),
				isOver: !!monitor.isOver(),
			}),
			// hover: (item, monitor) => {
			// 	console.debug('on hover item', item, 'monitor', monitor);
			// },
			item: {
				id: idProp,
			},
			// options: {}
		}),
		// A dependency array used for memoization.
		// This behaves like the built-in useMemoReact hook.
		// The default value is an empty array for function spec,
		// and an array containing the spec for an object spec.
		// []
	);
	// console.debug('dropProps', dropProps);
	const { canDrop, isOver } = dropProps;

	return <Ref innerRef={drop}>
		{
			isDragging
				? // What stays behind when dragging
				<Ref innerRef={dragPreview}>
					<Table.HeaderCell
						{...tableHeaderCellPropsExceptChildrenOrContentOrStyle}
						style={{
							...style,
							cursor: 'grabbing',
							opacity: 0.5,
						}}
					>
						{
							// It's important to keep the same width or table will reflow
							childrenUtils.isNil(children) ? content : children
						}
					</Table.HeaderCell>
				</Ref>
				: // Before dragging, and what's dragged
				<Ref innerRef={drag}>
					<Table.HeaderCell
						{...tableHeaderCellPropsExceptChildrenOrContentOrStyle}
						style={{
							...style,
							cursor: 'grab',
							position: 'relative', // To position overlays below
						}}
					>
						{childrenUtils.isNil(children) ? content : children}
						{/*isOver && !canDrop && <Overlay color='red' />*/}
						{!isOver && canDrop && <Overlay color='yellow' />}
						{isOver && canDrop && <Overlay color='green' />}
					</Table.HeaderCell>
				</Ref>
		}
	</Ref>;
}
