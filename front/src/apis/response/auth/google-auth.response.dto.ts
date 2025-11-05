export default interface GoogleAuthResponseDto {
    code: string;
    message: string;
    token: string;
    expirationTime: number;
}