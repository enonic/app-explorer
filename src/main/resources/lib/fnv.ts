declare const __ :{
	newBean :<T>(s :string) => T
	toNativeObject :<T>(t :T) => T
}

type FNV = {
	fnv1_32 :(data :unknown) => number
	fnv1_64 :(data :unknown) => number
	fnv1a_32 :(data :unknown) => number
	fnv1a_64 :(data :unknown) => number
	toHex :(interger: number) => string
}


const BEAN = __.newBean<FNV>('com.enonic.explorer.FNV');

export const fnv = ({
	data,
	bits = 32,
	version = '1a', // '1'
	encoding = 'number' // 'hex'
}) => __.toNativeObject<string|number>(encoding === 'hex'
	? BEAN.toHex(BEAN[`fnv${version}_${bits}`](data))
	: BEAN[`fnv${version}_${bits}`](data)
);

export const fnv1_32 = (data :unknown) => __.toNativeObject(BEAN.fnv1_32(data));
export const fnv1_64 = (data :unknown) => __.toNativeObject(BEAN.fnv1_64(data));
export const fnv1a_32 = (data :unknown) => __.toNativeObject(BEAN.fnv1a_32(data));
export const fnv1a_64 = (data :unknown) => __.toNativeObject(BEAN.fnv1a_64(data));

export const fnv1_32_hex = (data :unknown) => __.toNativeObject(BEAN.toHex(BEAN.fnv1_32(data)));
export const fnv1_64_hex = (data :unknown) => __.toNativeObject(BEAN.toHex(BEAN.fnv1_64(data)));
export const fnv1a_32_hex = (data :unknown) => __.toNativeObject(BEAN.toHex(BEAN.fnv1a_32(data)));
export const fnv1a_64_hex = (data :unknown) => __.toNativeObject(BEAN.toHex(BEAN.fnv1a_64(data)));

export const toHex = (number :number) => __.toNativeObject(BEAN.toHex(number));
