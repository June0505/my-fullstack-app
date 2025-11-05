import React, { ChangeEvent, useRef, useState, useMemo, useCallback } from 'react';
import './style.css';
import { useBoardStore, useLoginUserStore } from "../../../stores";
import { useNavigate } from "react-router-dom";
import { MAIN_PATH } from "../../../constants";
import { useCookies } from "react-cookie";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fileUploadRequest, postBoardRequest } from "../../../apis";
import { PostBoardRequestDto } from "../../../apis/request/board";
import { PostBoardResponseDto } from "../../../apis/response/board";
import { ResponseDto } from "../../../apis/response";

// interface: サイドバー画像の型定義
interface SidebarImage {
    file: File;
    url: string;
}

// component: 掲示物作成画面コンポーネント
export default function BoardWrite() {
    // state: DOM参照状態
    const titleRef = useRef<HTMLTextAreaElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const quillRef = useRef<ReactQuill | null>(null);

    // state: Storeから取得した状態と関数
    const { title, setTitle, content, setContent, resetBoard } = useBoardStore();
    const { loginUser } = useLoginUserStore();
    const [cookie] = useCookies();
    const navigate = useNavigate();

    // state: サイドバーに表示する画像リストの状態
    const [sidebarImages, setSidebarImages] = useState<SidebarImage[]>([]);

    // -------------------------
    // function: サーバー画像アップロード
    // -------------------------
    // ⭐️ useCallbackで定義し、内部でaccessTokenを処理するように修正
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
    }, [cookie.accessToken]); // cookie.accessToken を依存性に含める

    // -------------------------
    // function: Quill画像ハンドラー
    // -------------------------
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        // Quillツールバーの画像アップロード時、二重挿入を防ぐための処理
        const handleImageUpload = async () => {
            if (!input.files || input.files.length === 0) return;
            const file = input.files[0];

            // コールバック実行後、リスナーを削除
            input.removeEventListener('change', handleImageUpload);

            // ⭐️ uploadImageのシグネチャ変更に伴い、accessToken引数を削除
            const uploadedUrl = await uploadImage(file);
            if (!uploadedUrl || !quillRef.current) return;

            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();
            if (!range) return;

            editor.insertEmbed(range.index, 'image', uploadedUrl);
            editor.setSelection(range.index + 1);
        };

        input.addEventListener('change', handleImageUpload);

    }, [uploadImage]); // ⭐️ uploadImage を依存性に含める

    // const: Quillモジュール定義 (ツールバーと画像ハンドラー)
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }]
            ],
            handlers: { image: imageHandler }
        }
    }), [imageHandler]);

    // -------------------------
    // event handler: タイトル変更
    // -------------------------
    const onTitleChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        if (!titleRef.current) return;
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    };

    // event handler: 本文変更
    const onContentChangeHandler = (html: string) => {
        setContent(html);
    };

    // -------------------------
    // event handler: サイドバー画像アップロード
    // -------------------------
    const onSidebarImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        for (const file of files) {
            // ⭐️ uploadImageのシグネチャ変更に伴い、accessToken引数を削除
            const uploadedUrl = await uploadImage(file);
            if (!uploadedUrl) continue;
            setSidebarImages(prev => [...prev, { file, url: uploadedUrl }]);
        }

        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    // event handler: サイドバー画像削除
    const onSidebarImageDelete = (index: number) => {
        setSidebarImages(prev => prev.filter((_, i) => i !== index));
    };

    // event handler: 画像アップロードボタンクリック
    const onSidebarImageUploadClick = () => {
        imageInputRef.current?.click();
    };

    // event handler: ドラッグ開始時 (Quillエディタへの二重挿入防止)
    const onDragStartHandler = (e: React.DragEvent<HTMLDivElement>, imageUrl: string) => {
        // 画像URLをデータ転送し、QuillがファイルではなくURLとして認識するように誘導
        e.dataTransfer.setData('text/uri-list', imageUrl);
        e.dataTransfer.setData('text/plain', imageUrl);
        e.dataTransfer.effectAllowed = 'copy';
    };

    // event handler: ドラッグオーバー
    const onDragOverHandler = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    // event handler: ドロップ時 (サイドバーへの画像追加)
    const onDropHandler = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));

        for (const file of files) {
            // ⭐️ uploadImageのシグネチャ変更に伴い、accessToken引数を削除
            const uploadedUrl = await uploadImage(file);
            if (!uploadedUrl) continue;
            setSidebarImages(prev => [...prev, { file, url: uploadedUrl }]);
        }
    };

    // -------------------------
    // event handler: 掲示物アップロード
    // -------------------------
    const onUploadClick = async () => {
        const accessToken = cookie.accessToken;
        if (!accessToken) return;

        // 本文から画像URLのみを抽出
        const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
        const boardImageList: string[] = [];
        let match;
        while ((match = imgTagRegex.exec(content)) !== null) {
            const url = match[1];
            if (url) boardImageList.push(url);
        }

        const boardTitleImage = boardImageList[0] || null;

        const requestBody: PostBoardRequestDto = {
            title,
            content,
            boardImageList,
            boardTitleImage
        };

        const res: PostBoardResponseDto | ResponseDto | null = await postBoardRequest(requestBody, accessToken);
        if (!res) return;

        if (res.code === 'AF' || res.code === 'NU') return navigate(MAIN_PATH());
        if (res.code === 'VF') return console.error('タイトルと内容は必須です。');
        if (res.code === 'DBE') return console.error('データベースエラーです。');
        if (res.code === 'SU') {
            resetBoard();
            if (!loginUser) return;
            navigate(`/user/${loginUser.email}`);
        }
    };

    // event handler: キャンセルボタンクリック
    const onCancelClick = () => navigate(-1);

    // const: 本文が空であるかをチェック
    const isContentEmpty =
        !content ||
        content === '<p><br></p>' ||
        content === '<p><span class="ql-size-small"><br></span></p>';

    // render: 掲示物作成画面コンポーネントをレンダリング
    return (
        <div id='board-write-wrapper'>
            <div className='board-write-container'>
                <div className='editor-main-area'>
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

                    <div className='board-write-submit-area'>
                        <button className='board-write-cancel-button' onClick={onCancelClick}>
                            キャンセル
                        </button>
                        <button
                            className={`board-write-submit-button ${!(title && !isContentEmpty) ? 'disable' : ''}`}
                            onClick={onUploadClick}
                            disabled={!(title && !isContentEmpty)}
                        >
                            アップロード
                        </button>
                    </div>
                </div>

                <div className='editor-sidebar-area'>
                    <div className='sidebar-content-box'>
                        <input
                            ref={imageInputRef}
                            type='file'
                            accept='image/*'
                            multiple
                            style={{ display: 'none' }}
                            onChange={onSidebarImageChange}
                        />
                        <div
                            className='board-write-upload-guide-box'
                            onDragOver={onDragOverHandler}
                            onDrop={onDropHandler}
                            onClick={onSidebarImageUploadClick}
                        >
                            <div className='camera-icon'></div>
                            <p className='guide-text'>
                                ここにドラッグするか、<br />クリックしてアップロードできます。
                            </p>
                            <button className='board-write-image-upload-button-visual'>
                                画像アップロード
                            </button>
                        </div>

                        <div className='board-write-images-box'>
                            {sidebarImages.map((img, i) => (
                                <div
                                    key={i}
                                    className='board-write-image-box'
                                    draggable={true}
                                    onDragStart={(e) => onDragStartHandler(e, img.url)}
                                >
                                    <img className='board-write-image' src={img.url} alt={`サイドバー画像 ${i+1}`} />
                                    <div className='image-close' onClick={() => onSidebarImageDelete(i)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
