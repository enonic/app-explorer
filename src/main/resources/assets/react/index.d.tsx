import type {CollectorProps} from '/lib/explorer/types/index.d';


export type CollectorComponent = (props :CollectorProps) => JSX.Element;
export type CollectorComponents = Record<string,CollectorComponent>;

export type Locale = {
	country :string
	displayName :string
	tag :string
}
export type Locales = Array<Locale>

export type SetLicensedToFunction = (to :string) => void;
export type SetLicenseValidFunction = (valid :boolean) => void;
