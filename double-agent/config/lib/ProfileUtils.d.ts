export declare function extractProfilePathsMap(profileDir: string, userAgentId: string, profilePathsMap?: IProfilePathsMap): IProfilePathsMap;
export declare function importProfile<TProfile>(profilePath: IProfilePath): TProfile;
export interface IProfilePathsMap {
    [pluginId: string]: {
        [userAgentId: string]: IProfilePath;
    };
}
export declare type IProfilePath = string | {
    [filenameSuffix: string]: string;
};
