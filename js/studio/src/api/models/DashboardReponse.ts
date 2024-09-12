/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatorStatistics } from './CreatorStatistics';
import type { Podcast } from './Podcast';
import type { Podclip } from './Podclip';
export type DashboardReponse = {
    statistics: CreatorStatistics;
    top_podcasts: Array<Podcast>;
    top_podclips: Array<Podclip>;
};

