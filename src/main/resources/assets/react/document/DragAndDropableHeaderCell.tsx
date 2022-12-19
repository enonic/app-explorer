import type {
	StrictTableHeaderCellProps,
	// TableHeaderCellProps,
} from 'semantic-ui-react';


interface Item {
	id: number
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
		index: number
		onDrop: ({
			fromIndex,
			toIndex
		}: {
			fromIndex: number
			toIndex: number
		}) => void
		style?: React.CSSProperties // "missing" from StrictTableHeaderCellProps
	}
) {
	const {
		children,
		content,
		index,
		onDrop = () => {/* default no-op dummy just in case */},
		style = {},
		...tableHeaderCellPropsExceptChildrenOrContentOrStyle
	} = props;

	const [dragProps, drag, dragPreview] = useDrag<Item, unknown, {
		isDragging: boolean
	}>(() => ({
		type: 'HeaderCell',
		// canDrag: (monitor)=> {
		// 	console.debug('on canDrag monitor', monitor, 'index', index);
		// 	return true;
		// },
		collect: monitor => ({
			isDragging: !!monitor.isDragging(),
		}),
		// end: (item, monitor) => {
		// 	console.debug('on drag end item', item, 'monitor', monitor, 'index', index);
		// },
		// isDragging: (monitor) => {
		// 	console.debug('on isDragging monitor', monitor, 'index', index);
		// 	return true;
		// },
		item: { id: index },
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
	}));
	// console.debug('dragProps', dragProps);
	const { isDragging } = dragProps;

	const [dropProps, drop] = useDrop<Item, unknown, {
		canDrop: boolean,
		isOver: boolean
	}>(
		() => ({
			accept: 'HeaderCell',
			canDrop: (item/*, monitor*/) => {
				// console.debug('on canDrop item', item, 'monitor', monitor, 'index', index);
				const {id} = item;
				return id !== index;
			},
			drop: (item/*, monitor*/) => {
				// console.debug('on drop item', item, 'monitor', monitor, 'index', index);
				const {id} = item; // The dropped item
				// index is the target index
				onDrop({
					fromIndex: id,
					toIndex: index
				});
			},
			collect: (monitor) => ({
				canDrop: !!monitor.canDrop(),
				isOver: !!monitor.isOver(),
			}),
			// hover: (item, monitor) => {
			// 	console.debug('on hover item', item, 'monitor', monitor, 'index', index);
			// },
			item: { id: index },
			// options: {}
		}),
		[index]
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
							opacity: 0,
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
