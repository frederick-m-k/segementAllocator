
/**
 * All possible errors
 */
export enum Errors {
    NO_ERROR = 1,
    TIER_ERROR = 2,
    FILE_ERROR = 3,
    TOO_MANY_FILES_ERROR = 4,
    WRONG_FILE_TYPE_ERROR = 5,
    PROVIDE_BOTH_TIERS_ERROR = 6,
    UNHANDLED_ERROR = 7
}

/**
 * Messages for all possible errors
 */
export enum ErrorMessages {
    NO_ERROR = "",
    TIER_ERROR = "Did you provide the correct tiers?",
    FILE_ERROR = "",
    TOO_MANY_FILES_ERROR = "Provide only one file!",
    WRONG_FILE_TYPE_ERROR = "File format is not supported!",
    PROVIDE_BOTH_TIERS_ERROR = "Provide both tier names!",
    UNHANDLED_ERROR = "Unhandled error!"
}