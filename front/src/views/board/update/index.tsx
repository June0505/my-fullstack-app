import React, { ChangeEvent, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './style.css';
import { useBoardStore, useLoginUserStore } from "../../../stores";
import { useNavigate, useParams } from "react-router-dom";
import { MAIN_PATH } from "../../../constants";
import { useCookies } from "react-cookie";
import { getBoardRequest, fileUploadRequest, patchBoardRequest } from "../../../apis";
import { GetBoardResponseDto } from "../../../apis/response/board";
import { PatchBoardRequestDto } from "../../../apis/request/board";
import { ResponseDto } from "../../../apis/response";
import { convertUrlsToFile } from "../../../utils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Component: 掲示物修正画面コンポーネント (BoardUpdate)
export default function BoardUpdate() {

    // State & Ref
    const titleRef = useRef<HTMLTextAreaElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const quillRef = useRef<ReactQuill | null>(null);

    // Storeから取得した状態と関数
    const { title, setTitle, content, setContent, boardImageFileList, setBoardImageFileList, resetBoard } = useBoardStore();
    const { loginUser } = useLoginUserStore();
    const [cookie] = useCookies();
    const navigate = useNavigate();
    const { boardNumber } = useParams<{ boardNumber?: string }>();
    // state: サイドバーに表示する画像URLのリスト
    const [imageUrls, setImageUrls] = useState<string[]>([]);


    // Function: 画像アップロード (useCallbackで定義し、内部でaccessTokenを処理)
    // fileUploadRequestにaccessTokenを渡すように修正
    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        const accessToken = cookie.accessToken;
        if (!accessToken) {
            alert('認証情報がありません。再度ログインしてください。');
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            // 修正済みの fileUploadRequest に accessToken を渡します。
            const uploadedUrl = await fileUploadRequest(formData, accessToken);
            return uploadedUrl;
        } catch (error) {
            console.error('画像アップロードに失敗しました:', error);
            return null;
        }
    }, [cookie.accessToken]); // cookie.accessToken が変更されたときに再生成


    // Function: 掲示物修正 response処理関数
    const patchBoardResponse = (responseBody: ResponseDto | null) => {
        if (!responseBody) return;

        const { code } = responseBody;

        // エラー処理
        if (code === 'VF') alert('タイトルと内容は必須です。');
        if (code === 'NU') alert('存在しないユーザーです。');
        if (code === 'NB') alert('存在しない掲示物です。');
        if (code === 'AF') alert('認証に失敗しました。');
        if (code === 'DBE') alert('データベースエラーが発生しました。');

        // エラー発生時はメインへ移動
        if (code !== 'SU') {
            if (code === 'AF' || code === 'NU' || code === 'NB') {
                navigate(MAIN_PATH());
            }
            return;
        }

        // 成功時
        resetBoard();
        navigate(`/board/detail/${boardNumber}`);
    };

    // Function: 掲示物読み込み response処理関数
    const getBoardResponse = (responseBody: GetBoardResponseDto | ResponseDto | null)=> {
        if (!responseBody) return;

        const { code } = responseBody;

        // エラー処理
        if (code === 'NB') alert('存在しない掲示物です。');
        if (code === 'DBE') alert('データベースエラーが発生しました。');

        if (code !== 'SU') {
            navigate(MAIN_PATH());
            return;
        }

        const body = responseBody as GetBoardResponseDto;
        setTitle(body.title);
        setContent(body.content);
        // URLリストをStateに設定
        setImageUrls(body.boardImageList || []);
        // URLをFileオブジェクトに変換し、Storeに設定
        convertUrlsToFile(body.boardImageList || []).then(files => setBoardImageFileList(files));

        // ログインユーザーと作成者が異なる場合、メインへ移動
        if (!loginUser || loginUser.email !== body.writerEmail) {
            navigate(MAIN_PATH());
            return;
        }
    };


    // Event Handler: Quill 画像ハンドラー
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        const handleImageUpload = async () => {
            if (!input.files || input.files.length === 0) return;
            const file = input.files[0];
            input.removeEventListener('change', handleImageUpload);

            // ⭐️ uploadImageが内部でaccessTokenを取得するため、引数から削除
            const uploadedUrl = await uploadImage(file);
            if (!uploadedUrl || !quillRef.current) return;

            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();

            // 画像をエディタに挿入
            if (range && typeof range.index === 'number') {
                editor.insertEmbed(range.index, 'image', uploadedUrl);
                editor.setSelection(range.index + 1);
            } else {
                const idx = Math.max(0, editor.getLength() - 1);
                editor.insertEmbed(idx, 'image', uploadedUrl);
                editor.setSelection(idx + 1);
            }
        };
        input.addEventListener('change', handleImageUpload);
    }, [uploadImage]); // uploadImageを依存性に追加


    // const: Quillモジュール定義 (ツールバーと画像ハンドラー)
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                // 'normal' の代わりに Quillのデフォルトサイズを表す 'false' を使用
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
            ],
            handlers: { image: imageHandler }
        }
    }), [imageHandler]);


    // Event Handler: タイトル変更
    const onTitleChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        if (!titleRef.current) return;
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    };

    // Event Handler: 本文変更
    const onContentChangeHandler = (html: string) => {
        setContent(html);
    };


    // Event Handler: サイドバー画像ファイル変更時
    const onImageChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files.length) return;
        const file = event.target.files[0];

        // ⭐️ uploadImageが内部でaccessTokenを取得するため、引数から削除
        const uploadedUrl = await uploadImage(file);
        if (!uploadedUrl) return;

        // URLリストに追加
        setImageUrls(prev => [...prev, uploadedUrl]);

        // Fileリストに追加
        const newBoardImageFileList = [...boardImageFileList, file];
        setBoardImageFileList(newBoardImageFileList);

        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    // Event Handler: サイドバー画像アップロードボタンクリック
    const onImageUploadButtonClickHandler = () => {
        imageInputRef.current?.click();
    };

    // Event Handler: サイドバー画像削除
    const onCloseImageButtonClickHandler = (deleteIndex: number) => {
        if (imageInputRef.current) imageInputRef.current.value = '';

        // URLリストから削除
        setImageUrls(prev => prev.filter((_, idx) => idx !== deleteIndex));

        // Fileリストから削除
        const newBoardImageFileList = boardImageFileList.filter((_, idx) => idx !== deleteIndex);
        setBoardImageFileList(newBoardImageFileList);
    };


    // Event Handler: ドラッグ開始 (Quill挿入用)
    const onDragStartHandler = (e: React.DragEvent<HTMLDivElement>, imageUrl: string) => {
        e.dataTransfer.setData('text/uri-list', imageUrl);
        e.dataTransfer.setData('text/plain', imageUrl);
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Event Handler: ドロップ領域オーバー (サイドバーアップロード用)
    const onDragOverHandler = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    // Event Handler: ドロップ (サイドバーアップロード用)
    const onDropHandler = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        for (const file of files) {
            // ⭐️ uploadImageが内部でaccessTokenを取得するため、引数から削除
            const uploadedUrl = await uploadImage(file);
            if (!uploadedUrl) continue;

            // URLリストに追加
            setImageUrls(prev => [...prev, uploadedUrl]);

            // Fileリストに追加
            const newBoardImageFileList = [...boardImageFileList, file];
            setBoardImageFileList(newBoardImageFileList);
        }
    };

    // Event Handler: 修正完了ボタンクリック
    const onUpdateClick = async () => {
        const accessToken = cookie.accessToken;
        if (!accessToken || !boardNumber) return;

        // 本文に使用されている画像URLを抽出
        const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
        const boardImageList: string[] = [];
        let match;
        while ((match = imgTagRegex.exec(content)) !== null) {
            const url = match[1];
            if (url) boardImageList.push(url);
        }

        const requestBody: PatchBoardRequestDto = {
            title,
            content,
            boardImageList
        };

        // patchBoardRequestはすでにaccessTokenを渡しています。
        patchBoardRequest(boardNumber, requestBody, accessToken).then(patchBoardResponse);
    };

    // Event Handler: キャンセルボタンクリック
    const onCancelClick = () => navigate(-1);

    // Effect: コンポーネントマウント時、掲示物を読み込む
    useEffect(() => {
        const accessToken = cookie.accessToken;
        if (!accessToken) {
            navigate(MAIN_PATH());
            return;
        }
        if (!boardNumber) return;

        getBoardRequest(boardNumber).then(getBoardResponse);
        // クリーンアップ関数でStoreをリセット
        return () => resetBoard();
    }, [boardNumber, cookie.accessToken, navigate, loginUser]);

    // Effect: title状態が変更されたときにタイトルtextareaの高さを調整
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
        }
    }, [title]);


    // Render Helper: 本文が空であるかをチェック
    const isContentEmpty =
        !content ||
        content === '<p><br></p>' ||
        content === '<p><span class="ql-size-small"><br></span></p>';

    // Render: 掲示物修正画面コンポーネントをレンダリング
    return (
        <div id='board-write-wrapper'>
            <div className='board-write-container'>

                {/* 1. メイン編集エリア */}
                <div className='editor-main-area'>

                    {/* タイトル */}
                    <div className='board-write-title-box'>
                        <textarea
                            ref={titleRef}
                            className='board-write-title-textarea'
                            rows={1}
                            placeholder='タイトルを入力してください。'
                            value={title}
                            onChange={onTitleChangeHandler}
                        />
                    </div>

                    {/* Quillエリア */}
                    <div className='board-write-content-box-quill'>
                        <ReactQuill
                            ref={quillRef}
                            className='board-write-content-quill'
                            modules={modules}
                            theme="snow"
                            value={content}
                            onChange={onContentChangeHandler}
                        />
                    </div>

                    {/* ボタンエリア */}
                    <div className='board-write-submit-area'>
                        <button className='board-write-cancel-button' onClick={onCancelClick}>
                            キャンセル
                        </button>
                        <button
                            className={`board-write-submit-button ${!(title && !isContentEmpty) ? 'disable' : ''}`}
                            onClick={onUpdateClick}
                            disabled={!(title && !isContentEmpty)}
                        >
                            修正完了
                        </button>
                    </div>
                </div>

                {/* 2. サイドバーエリア */}
                <div className='editor-sidebar-area'>
                    <div className='sidebar-content-box'>

                        {/* 非表示のファイル入力 */}
                        <input
                            ref={imageInputRef}
                            type='file'
                            accept='image/*'
                            style={{ display: 'none' }}
                            onChange={onImageChangeHandler}
                        />

                        {/* 画像アップロードガイドボックス */}
                        <div
                            className='board-write-upload-guide-box'
                            onClick={onImageUploadButtonClickHandler}
                            onDragOver={onDragOverHandler}
                            onDrop={onDropHandler}
                        >
                            <div className='camera-icon'></div>
                            <p className='guide-text'>
                                画像をここにドラッグ＆ドロップ<br/>
                                またはクリックしてファイルを選択してください。
                            </p>
                            <button className='board-write-image-upload-button-visual'>
                                ファイルを選択
                            </button>
                        </div>

                        {/* 画像プレビューボックス */}
                        <div className='board-write-images-box'>
                            {imageUrls.map((imageUrl, index) => (
                                <div className='board-write-image-box' key={index} draggable={true} onDragStart={(e) => onDragStartHandler(e, imageUrl)}>
                                    <img
                                        className='board-write-image'
                                        src={imageUrl}
                                        alt={`preview-${index}`}
                                    />
                                    <div className='image-close' onClick={() => onCloseImageButtonClickHandler(index)}>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
