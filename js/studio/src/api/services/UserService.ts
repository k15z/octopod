/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_user_token } from '../models/Body_user_token';
import type { RegisterUserRequest } from '../models/RegisterUserRequest';
import type { Token } from '../models/Token';
import type { UpdateUserRequest } from '../models/UpdateUserRequest';
import type { UserProfile } from '../models/UserProfile';
import type { UserStatistics } from '../models/UserStatistics';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * User Register
     * @param requestBody
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static userRegister(
        requestBody: RegisterUserRequest,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * User Token
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static userToken(
        formData: Body_user_token,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * User Profile
     * @returns UserProfile Successful Response
     * @throws ApiError
     */
    public static userProfile(): CancelablePromise<UserProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/profile',
        });
    }
    /**
     * Update User Profile
     * @param requestBody
     * @returns UserProfile Successful Response
     * @throws ApiError
     */
    public static updateUserProfile(
        requestBody: UpdateUserRequest,
    ): CancelablePromise<UserProfile> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/profile',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * User Statistics
     * @returns UserStatistics Successful Response
     * @throws ApiError
     */
    public static userStatistics(): CancelablePromise<UserStatistics> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/statistics',
        });
    }
}
