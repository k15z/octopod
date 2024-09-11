// This file is auto-generated by @hey-api/openapi-ts

export const Body_creator_tokenSchema = {
    properties: {
        grant_type: {
            anyOf: [
                {
                    type: 'string',
                    pattern: 'password'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Grant Type'
        },
        username: {
            type: 'string',
            title: 'Username'
        },
        password: {
            type: 'string',
            title: 'Password'
        },
        scope: {
            type: 'string',
            title: 'Scope',
            default: ''
        },
        client_id: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Client Id'
        },
        client_secret: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Client Secret'
        }
    },
    type: 'object',
    required: ['username', 'password'],
    title: 'Body_creator_token'
} as const;

export const Body_user_tokenSchema = {
    properties: {
        grant_type: {
            anyOf: [
                {
                    type: 'string',
                    pattern: 'password'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Grant Type'
        },
        username: {
            type: 'string',
            title: 'Username'
        },
        password: {
            type: 'string',
            title: 'Password'
        },
        scope: {
            type: 'string',
            title: 'Scope',
            default: ''
        },
        client_id: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Client Id'
        },
        client_secret: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Client Secret'
        }
    },
    type: 'object',
    required: ['username', 'password'],
    title: 'Body_user_token'
} as const;

export const CreatePodcastRequestSchema = {
    properties: {
        title: {
            type: 'string',
            title: 'Title',
            description: 'Title of the podcast.'
        },
        description: {
            type: 'string',
            title: 'Description',
            description: 'Description of the podcast.'
        },
        published_at: {
            anyOf: [
                {
                    type: 'string',
                    format: 'date-time'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Published At',
            description: 'Date and time of publication.'
        },
        cover_url: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Cover Url',
            description: 'URL to the podcast cover image.'
        },
        audio_url: {
            type: 'string',
            title: 'Audio Url',
            description: 'Audio file with the full podcast.'
        }
    },
    type: 'object',
    required: ['title', 'description', 'published_at', 'cover_url', 'audio_url'],
    title: 'CreatePodcastRequest'
} as const;

export const CreatorProfileSchema = {
    properties: {
        name: {
            type: 'string',
            title: 'Name'
        },
        email: {
            type: 'string',
            title: 'Email'
        },
        uma_address: {
            type: 'string',
            title: 'Uma Address'
        }
    },
    type: 'object',
    required: ['name', 'email', 'uma_address'],
    title: 'CreatorProfile'
} as const;

export const HTTPValidationErrorSchema = {
    properties: {
        detail: {
            items: {
                '$ref': '#/components/schemas/ValidationError'
            },
            type: 'array',
            title: 'Detail'
        }
    },
    type: 'object',
    title: 'HTTPValidationError'
} as const;

export const ListPodcastsResponseSchema = {
    properties: {
        results: {
            items: {
                '$ref': '#/components/schemas/Podcast'
            },
            type: 'array',
            title: 'Results'
        }
    },
    type: 'object',
    required: ['results'],
    title: 'ListPodcastsResponse'
} as const;

export const ListPodclipsResponseSchema = {
    properties: {
        results: {
            items: {
                '$ref': '#/components/schemas/Podclip'
            },
            type: 'array',
            title: 'Results'
        }
    },
    type: 'object',
    required: ['results'],
    title: 'ListPodclipsResponse'
} as const;

export const MakePlaylistResponseSchema = {
    properties: {
        duration: {
            type: 'integer',
            title: 'Duration'
        },
        results: {
            items: {
                '$ref': '#/components/schemas/Podclip'
            },
            type: 'array',
            title: 'Results'
        }
    },
    type: 'object',
    required: ['duration', 'results'],
    title: 'MakePlaylistResponse'
} as const;

export const PaymentResponseSchema = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            title: 'Id'
        },
        created_at: {
            type: 'string',
            format: 'date-time',
            title: 'Created At'
        },
        sender_id: {
            type: 'string',
            format: 'uuid',
            title: 'Sender Id'
        },
        sender_email: {
            type: 'string',
            title: 'Sender Email'
        },
        amount: {
            type: 'integer',
            title: 'Amount'
        }
    },
    type: 'object',
    required: ['id', 'created_at', 'sender_id', 'sender_email', 'amount'],
    title: 'PaymentResponse'
} as const;

export const PodcastSchema = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            title: 'Id'
        },
        title: {
            type: 'string',
            title: 'Title',
            description: 'Title of the podcast.'
        },
        description: {
            type: 'string',
            title: 'Description',
            description: 'Description of the podcast.'
        },
        creator_name: {
            type: 'string',
            title: 'Creator Name',
            description: 'Name of the creator.'
        },
        published_at: {
            anyOf: [
                {
                    type: 'string',
                    format: 'date-time'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Published At',
            description: 'Date and time of publication.'
        },
        duration: {
            type: 'number',
            title: 'Duration',
            description: 'Duration in seconds.'
        },
        cover_url: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Cover Url',
            description: 'URL to the podcast cover image.'
        },
        audio_url: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Audio Url',
            description: 'Audio file with the full podcast.'
        }
    },
    type: 'object',
    required: ['id', 'title', 'description', 'creator_name', 'published_at', 'duration', 'cover_url', 'audio_url'],
    title: 'Podcast'
} as const;

export const PodclipSchema = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            title: 'Id'
        },
        title: {
            type: 'string',
            title: 'Title',
            description: 'Title of the podclip.'
        },
        description: {
            type: 'string',
            title: 'Description',
            description: 'Description of the podclip.'
        },
        audio_url: {
            type: 'string',
            title: 'Audio Url',
            description: 'Audio file with intro/outro.'
        },
        duration: {
            type: 'integer',
            title: 'Duration',
            description: 'Duration in seconds including intro/outro.'
        },
        podcast: {
            '$ref': '#/components/schemas/Podcast',
            description: 'The podcast that the clip was extracted from.'
        },
        start_time: {
            type: 'number',
            title: 'Start Time',
            description: 'Start time in seconds in the parent podcast.'
        },
        end_time: {
            type: 'number',
            title: 'End Time',
            description: 'End time in seconds in the parent podcast.'
        }
    },
    type: 'object',
    required: ['id', 'title', 'description', 'audio_url', 'duration', 'podcast', 'start_time', 'end_time'],
    title: 'Podclip'
} as const;

export const PresignedUrlResponseSchema = {
    properties: {
        file_url: {
            type: 'string',
            title: 'File Url',
            description: 'URL to access the file after uploading.'
        },
        presigned_url: {
            type: 'string',
            title: 'Presigned Url',
            description: 'Presigned URL to upload the file.'
        }
    },
    type: 'object',
    required: ['file_url', 'presigned_url'],
    title: 'PresignedUrlResponse'
} as const;

export const RegisterCreatorRequestSchema = {
    properties: {
        email: {
            type: 'string',
            title: 'Email'
        },
        name: {
            type: 'string',
            title: 'Name'
        },
        uma_address: {
            type: 'string',
            title: 'Uma Address'
        }
    },
    type: 'object',
    required: ['email', 'name', 'uma_address'],
    title: 'RegisterCreatorRequest'
} as const;

export const RegisterUserRequestSchema = {
    properties: {
        email: {
            type: 'string',
            title: 'Email'
        },
        nwc_string: {
            type: 'string',
            title: 'Nwc String'
        }
    },
    type: 'object',
    required: ['email', 'nwc_string'],
    title: 'RegisterUserRequest'
} as const;

export const TokenSchema = {
    properties: {
        access_token: {
            type: 'string',
            title: 'Access Token'
        },
        token_type: {
            type: 'string',
            title: 'Token Type'
        }
    },
    type: 'object',
    required: ['access_token', 'token_type'],
    title: 'Token'
} as const;

export const UpdatePodcastRequestSchema = {
    properties: {
        title: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Title',
            description: 'Title of the podcast.'
        },
        description: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Description',
            description: 'Description of the podcast.'
        },
        published_at: {
            anyOf: [
                {
                    type: 'string',
                    format: 'date-time'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Published At',
            description: 'Date and time of publication.'
        },
        cover_url: {
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ],
            title: 'Cover Url',
            description: 'URL to the podcast cover image.'
        }
    },
    type: 'object',
    required: ['title', 'description', 'published_at', 'cover_url'],
    title: 'UpdatePodcastRequest'
} as const;

export const UpdatePodclipRequestSchema = {
    properties: {
        title: {
            type: 'string',
            title: 'Title',
            description: 'Title of the podclip.'
        },
        description: {
            type: 'string',
            title: 'Description',
            description: 'Description of the podclip.'
        }
    },
    type: 'object',
    required: ['title', 'description'],
    title: 'UpdatePodclipRequest'
} as const;

export const UserProfileSchema = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            title: 'Id'
        },
        email: {
            type: 'string',
            title: 'Email'
        },
        nwc_string: {
            type: 'string',
            title: 'Nwc String'
        }
    },
    type: 'object',
    required: ['id', 'email', 'nwc_string'],
    title: 'UserProfile'
} as const;

export const ValidationErrorSchema = {
    properties: {
        loc: {
            items: {
                anyOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'integer'
                    }
                ]
            },
            type: 'array',
            title: 'Location'
        },
        msg: {
            type: 'string',
            title: 'Message'
        },
        type: {
            type: 'string',
            title: 'Error Type'
        }
    },
    type: 'object',
    required: ['loc', 'msg', 'type'],
    title: 'ValidationError'
} as const;