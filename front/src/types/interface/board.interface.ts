export default interface Board {
    boardNumber: number;
    title: string;
    content: string;
    boardImageList: string[];
    writerEmail: string;
    writeDatetime: string;
    writerNickname: string;
    writerProfileImage: string | null;
}