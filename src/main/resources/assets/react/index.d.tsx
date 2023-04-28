import type {
	AnyObject,
	CollectorComponentRef,
	CollectorProps
} from '@enonic-types/lib-explorer';


export type CollectorComponent<CollectorConfig extends AnyObject = AnyObject> = (props :CollectorProps & {
	ref :CollectorComponentRef<CollectorConfig>
}) => JSX.Element;
export type CollectorComponents = Record<string,CollectorComponent>;

export type Locale = {
	country ?:string // zxx has no country
	displayName :string
	tag :string
}
export type Locales = Array<Locale>

export type SetLicensedToFunction = (to :string) => void;
export type SetLicenseValidFunction = (valid :boolean) => void;

export type LicenseBsd2Clause = 'BSD 2-Clause'
export type LicenseBsd3Clause = 'BSD 3-Clause'
export type LicenseMit = 'MIT'
export type License = LicenseBsd2Clause | LicenseBsd3Clause | LicenseMit
