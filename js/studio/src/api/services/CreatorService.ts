/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_creator_token } from '../models/Body_creator_token';
import type { CreatorProfile } from '../models/CreatorProfile';
import type { DashboardReponse } from '../models/DashboardReponse';
import type { PaymentResponse } from '../models/PaymentResponse';
import type { PodcastAnalytics } from '../models/PodcastAnalytics';
import type { RegisterCreatorRequest } from '../models/RegisterCreatorRequest';
import type { Token } from '../models/Token';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CreatorService {
    /**
     * Creator Register
     * @param requestBody
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static creatorRegister(
        requestBody: RegisterCreatorRequest,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/creator/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Creator Token
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static creatorToken(
        formData: Body_creator_token,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/creator/token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Creator Profile
     * @returns CreatorProfile Successful Response
     * @throws ApiError
     */
    public static creatorProfile(): CancelablePromise<CreatorProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/creator/profile',
        });
    }
    /**
     * Creator Payments
     * @returns PaymentResponse Successful Response
     * @throws ApiError
     */
    public static creatorPayments(): CancelablePromise<Array<PaymentResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/creator/payments',
        });
    }
    /**
     * Creator Dashboard
     * @returns DashboardReponse Successful Response
     * @throws ApiError
     */
    public static creatorDashboard(): CancelablePromise<DashboardReponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/creator/dashboard',
        });
    }
    /**
     * Podcast Breakdown
     * @param podcastId
     * @returns PodcastAnalytics Successful Response
     * @throws ApiError
     */
    public static podcastBreakdown(
        podcastId: string,
    ): CancelablePromise<PodcastAnalytics> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/creator/podcast/{podcast_id}',
            path: {
                'podcast_id': podcastId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
