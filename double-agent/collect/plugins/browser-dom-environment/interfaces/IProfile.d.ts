import IBaseProfile from '@double-agent/collect/interfaces/IBaseProfile';
declare type IProfile = IBaseProfile<IProfileData>;
export default IProfile;
export interface IProfileData {
    window: any;
    detached: any;
}
export interface IProfileDataByProtocol {
    http: IProfileData;
    https: IProfileData;
}
