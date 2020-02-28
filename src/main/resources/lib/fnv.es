const BEAN = __.newBean('com.enonic.explorer.FNV');

export const fnv = ({
  data,
  bits = 32,
  version = '1a', // '1'
  encoding = 'number' // 'hex'
}) => __.toNativeObject(encoding === 'hex'
    ? BEAN.toHex(BEAN[`fnv${version}_${bits}`](data))
    : BEAN[`fnv${version}_${bits}`](data)
);

export const fnv1_32 = (data) => __.toNativeObject(BEAN.fnv1_32(data));
export const fnv1_64 = (data) => __.toNativeObject(BEAN.fnv1_64(data));
export const fnv1a_32 = (data) => __.toNativeObject(BEAN.fnv1a_32(data));
export const fnv1a_64 = (data) => __.toNativeObject(BEAN.fnv1a_64(data));

export const fnv1_32_hex = (data) => __.toNativeObject(BEAN.toHex(BEAN.fnv1_32(data)));
export const fnv1_64_hex = (data) => __.toNativeObject(BEAN.toHex(BEAN.fnv1_64(data)));
export const fnv1a_32_hex = (data) => __.toNativeObject(BEAN.toHex(BEAN.fnv1a_32(data)));
export const fnv1a_64_hex = (data) => __.toNativeObject(BEAN.toHex(BEAN.fnv1a_64(data)));

export const toHex = (number) => __.toNativeObject(BEAN.toHex(number));
