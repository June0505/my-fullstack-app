import axios, { AxiosError } from "axios";
import {SignInRequestDto, SignUpRequestDto, GoogleAuthRequestDto} from './request/auth';
import {SignInResponseDto, SignUpResponseDto} from "./response/auth";
import {ResponseDto} from "./response";
import {
    GetSignInUserResponseDto,
    GetUserResponseDto,
    PatchNicknameResponseDto,
    PatchProfileImageResponseDto
} from "./response/user";
import {PatchBoardRequestDto, PostBoardRequestDto, PostCommentRequestDto} from "./request/board";
import {
    DeleteBoardResponseDto,
    GetBoardResponseDto,
    GetCommentListResponseDto,
    GetFavoriteListResponseDto,
    GetLatestBoardListResponseDto,
    GetSearchBoardListResponseDto,
    GetTop3BoardListResponseDto,
    GetUserBoardListResponseDto,
    IncreaseViewCountResponseDto,
    PatchBoardResponseDto,
    PostBoardResponseDto,
    PostCommentResponseDto,
    PutFavoriteResponseDto
} from "./response/board";
import {GetPopularListResponseDto, GetRelationListResponseDto} from "./response/search";
import {PatchNicknameRequestDto, PatchProfileImageRequestDto} from "./request/user";

const DOMAIN = window.location.origin;

const API_DOMAIN = `${DOMAIN}/api/v1`;

const authorization = (accessToken: string) => {
    return { headers: { 'Authorization': `Bearer ${accessToken}` } };
}

const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;
const GOOGLE_AUTH_URL = () => `${API_DOMAIN}/auth/google`;
const GOOGLE_SIGNUP_URL = () => `${API_DOMAIN}/auth/google/signup`;

export const signInRequest = async (requestBody: SignInRequestDto) => {
    const result = await axios.post<SignInResponseDto>(SIGN_IN_URL(), requestBody)
        .then(response => {
            const responseBody: SignInResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const signUpRequest = async(requestBody: SignUpRequestDto) => {
    const result = await axios.post<ResponseDto>(SIGN_UP_URL(), requestBody)
        .then(response => {
            const responseBody: SignUpResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

// ️ Google 인증 요청 함수
// 반환 타입: GoogleAuthResponseDto (성공: HTTP 200) | ResponseDto (실패: HTTP 4xx/5xx) | null (네트워크 에러)
export const googleAuthRequest = async (requestBody: GoogleAuthRequestDto) => {
    const result = await axios.post<ResponseDto>(GOOGLE_AUTH_URL(), requestBody)
        .then(response => {
            const responseBody = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

// Google 회원가입 요청 함수
// 반환 타입: SignUpResponseDto (성공: HTTP 200) | ResponseDto (실패: HTTP 4xx/5xx) | null (네트워크 에러)
export const googleSignUpRequest = async (requestBody: SignUpRequestDto) => {
    const result = await axios.post<SignUpResponseDto>(GOOGLE_SIGNUP_URL(), requestBody)
        .then(response => {
            const responseBody: SignUpResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}


const GET_POPULAR_LIST_URL = () => `${API_DOMAIN}/search/popular-list`;
const GET_RELATION_LIST_URL = (searchWord: string) => `${API_DOMAIN}/search/${searchWord}/relation-list`;

export const getPopularListRequest = async () => {
    const result = await axios.get(GET_POPULAR_LIST_URL())
        .then(response => {
            const responseBody: GetPopularListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getRelationListRequest = async (searchWord: string) => {
    const result = await axios.get(GET_RELATION_LIST_URL(searchWord))
        .then(response => {
            const responseBody: GetRelationListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const GET_USER_URL = (email: string) => `${API_DOMAIN}/user/${email}`;
const GET_SIGN_IN_USER_URL = () => `${API_DOMAIN}/user`;
const PATCH_NICKNAME_URL = () => `${API_DOMAIN}/user/nickname`;
const PATCH_PROFILE_IMAGE_URL = () => `${API_DOMAIN}/user/profile-image`;

export const getUserRequest = async (email: string) => {
    const result = await axios.get(GET_USER_URL(email))
        .then(response => {
            const responseBody: GetUserResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getSignInUserRequest = async (accessToken: string) => {
    const result = await axios.get(GET_SIGN_IN_USER_URL(), authorization(accessToken))
        .then(response => {
            const responseBody: GetSignInUserResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const patchNicknameRequest = async (requestBody: PatchNicknameRequestDto, accessToken: string) => {
    const result = await axios.patch(PATCH_NICKNAME_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PatchNicknameResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;

        })
    return result;
}

export const patchProfileImageRequest = async (requestBody: PatchProfileImageRequestDto, accessToken: string) => {
    const result = await axios.patch(PATCH_PROFILE_IMAGE_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PatchProfileImageResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const GET_BOARD_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}`
);
const GET_LATEST_BOARD_LIST_URL = () => (
    `${API_DOMAIN}/board/latest-list`
)
const GET_TOP_3_BOARD_LIST_URL = () => (
    `${API_DOMAIN}/board/top-3`
)
const GET_SEARCH_BOARD_LIST_URL = (searchWord: string, preSearchWord: string | null) => (
    preSearchWord
        ? `${API_DOMAIN}/board/search-list/${searchWord}/${preSearchWord}`
        : `${API_DOMAIN}/board/search-list/${searchWord}`
)
const GET_USER_BOARD_LIST_URL = (email: string) => (
    `${API_DOMAIN}/board/user-board-list/${email}`
)

const INCREASE_VIEW_COUNT_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}/increase-view-count`
)
const GET_FAVORITE_LIST_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}/favorite-list`
)
const GET_COMMENT_LIST_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}/comment-list`
)
const POST_BOARD_URL = () => `${API_DOMAIN}/board`;

const POST_COMMENT_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}/comment`
)
const PATCH_BOARD_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}`
)
const PUT_FAVORITE_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}/favorite`
)
const DELETE_BOARD_URL = (boardNumber: number | string) => (
    `${API_DOMAIN}/board/${boardNumber}`
)

export const getBoardRequest = async (boardNumber: number | string) => {
    const result = await axios.get(GET_BOARD_URL(boardNumber))
        .then(response => {
            const responseBody: GetBoardResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getLatestBoardListRequest = async () => {
    const result = await axios.get(GET_LATEST_BOARD_LIST_URL())
        .then(response => {
            const responseBody: GetLatestBoardListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getTop3BoardListRequest = async () => {
    const result = await axios.get(GET_TOP_3_BOARD_LIST_URL())
        .then(response => {
            const responseBody: GetTop3BoardListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getSearchBoardListRequest = async (searchWord: string, preSearchWord: string | null) => {
    const result = await axios.get(GET_SEARCH_BOARD_LIST_URL(searchWord, preSearchWord))
        .then(response => {
            const responseBody: GetSearchBoardListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getUserBoardListRequest = async (email: string) => {
    const result = await axios.get(GET_USER_BOARD_LIST_URL(email))
        .then(response => {
            const responseBody: GetUserBoardListResponseDto = response.data;
            return responseBody;
        }).catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const increaseViewCountRequest = async (boardNumber: number | string) => {
    const result = await axios.get(INCREASE_VIEW_COUNT_URL(boardNumber))
        .then(response => {
            const responseBody: IncreaseViewCountResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getFavoriteListRequest = async (boardNumber: number | string) => {
    const result = await axios.get(GET_FAVORITE_LIST_URL(boardNumber))
        .then(response => {
            const responseBody: GetFavoriteListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getCommentListRequest = async (boardNumber: number | string) => {
    const result = await axios.get(GET_COMMENT_LIST_URL(boardNumber))
        .then(response => {
            const responseBody: GetCommentListResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const postBoardRequest = async (requestBody: PostBoardRequestDto, accessToken: string) => {
    const result = await axios.post(POST_BOARD_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PostBoardResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const patchBoardRequest = async (boardNumber: number | string, requestBody: PatchBoardRequestDto, accessToken: string) => {
    const result = await axios.patch(PATCH_BOARD_URL(boardNumber), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PatchBoardResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const postCommentRequest = async (boardNumber: number | string, requestBody: PostCommentRequestDto, accessToken: string) => {
    const result = await axios.post(POST_COMMENT_URL(boardNumber), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PostCommentResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}


export const putFavoriteRequest = async (boardNumber: number | string, accessToken: string) => {
    const result = await axios.put(PUT_FAVORITE_URL(boardNumber), {}, authorization(accessToken))
        .then(response => {
            const responseBody: PutFavoriteResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const deleteBoardRequest = async (boardNumber: number | string, accessToken: string) => {
    const result = await axios.delete(DELETE_BOARD_URL(boardNumber), authorization(accessToken))
        .then(response => {
            const responseBody: DeleteBoardResponseDto = response.data;
            return responseBody;
        })
        .catch((error: AxiosError | any) => {
            if (!error.response || !error.response.data)
                return null;

            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const FILE_DOMAIN_API = `${API_DOMAIN}/file`;
const FILE_UPLOAD_URL = () => `${FILE_DOMAIN_API}/upload`;

export const fileUploadRequest = async (data: FormData, accessToken: string) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
        }
    }

    const result = await axios.post(FILE_UPLOAD_URL(), data, config)
        .then(response => {
            const responseBody: string = response.data;
            return responseBody;
        })
        .catch(error => {
            return null;
        })
    return result;
}