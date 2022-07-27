import type {
	AnyObject,
	CollectorComponentRef,
	CollectorProps
} from '/lib/explorer/types/index.d';


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
