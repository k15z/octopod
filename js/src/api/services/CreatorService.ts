/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_creator_token } from '../models/Body_creator_token';
import type { CreatorProfile } from '../models/CreatorProfile';
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
}
