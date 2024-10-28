import ms from 'ms';


export default function safeMs(strOrNum: string | number) {
	let result: string | number;
	try {
		result = ms(strOrNum) as string | number;
	} catch (e) {
		result = 'N/A';
	} finally {
		return result;
	}
}
