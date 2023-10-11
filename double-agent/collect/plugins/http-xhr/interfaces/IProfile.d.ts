import IBaseProfile from '@double-agent/collect/interfaces/IBaseProfile';
import IHeaderDataPage from '@double-agent/collect/interfaces/IHeaderDataPage';
declare type IProfile = IBaseProfile<IProfileData>;
export default IProfile;
export declare type IProfileData = IHeaderDataPage[];
