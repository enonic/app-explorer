import {Fragment} from 'react';


export default function Action({
	comment,
	curl = '',
	curlUrlParams = '',
	headers = {},
	method = 'GET',
	pattern,
	parameters = {},
}: {
	comment: string
	curl?: string
	curlUrlParams?: string
	headers?: Record<string, {
		value: string
		attributes: string
		description: string
	}>
	method: 'GET' | 'POST' | 'PUT' | 'DELETE'
	pattern: string
	parameters?: Record<string, {
		attributes: string
		default?: string
		description: string
	}>
}) {
	return <details className={`method-${method.toLocaleLowerCase()}`}>
		<summary><span>{method}</span> <b>{pattern}</b> {comment}</summary>
		<pre>
			curl -X{method} "{document.location.href}{pattern}{curlUrlParams}" {curl}
		</pre>
		{/* {
			Object.keys(headers).length === 0
				? null
				: <>
					<h3>Headers</h3>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Value</th>
								<th>Attributes</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(headers).map(([name, { value, attributes, description }]) => <tr key={name}>
								<td>{name}</td>
								<td>{value}</td>
								<td>{attributes}</td>
								<td>{description}</td>
							</tr>)}
						</tbody>
					</table>
				</>
		}
		{
			Object.keys(parameters).length === 0
				? null
				: <>
					<h3>Parameters</h3>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Attributes</th>
								<th>Default</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(parameters).map(([name, { attributes, default: value, description }]) => <tr key={name}>
								<td>{name}</td>
								<td>{attributes}</td>
								<td>{value}</td>
								<td>{description}</td>
							</tr>)}
						</tbody>
					</table>
				</>
		} */}
	</details>;
}
