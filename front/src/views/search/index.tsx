import React, { useEffect, useState } from 'react';
import './style.css';
import { useNavigate, useParams } from "react-router-dom";
import { BoardListItem } from "../../types/interface";
import BoardItem from "../../components/BoardItem";
import { SEARCH_PATH } from "../../constants";
import Pagination from "../../components/pagination";
import { getRelationListRequest, getSearchBoardListRequest } from "../../apis";
import { GetSearchBoardListResponseDto } from "../../apis/response/board";
import { ResponseDto } from "../../apis/response";
import { usePagination } from "../../hooks";
import { GetRelationListResponseDto } from "../../apis/response/search";

// component: 検索画面コンポーネント
export default function Search() {

    // state: searchWord path variable 状態
    const { searchWord } = useParams();

    // state: ページネーション関連状態
    const {
        currentPage,
        setCurrentPage,
        currentSection,
        setCurrentSection,
        viewList,
        viewPageList,
        totalSection,
        setTotalList
    } = usePagination<BoardListItem>(5);

    // state: 前回の検索ワード状態
    const [preSearchWord, setPreSearchWord] = useState<string | null>(null);

    // state: 検索結果の件数状態
    const [searchBoardCount, setSearchBoardCount] = useState<number>(0);

    // state: 関連キーワードリスト状態
    const [relativeWordlist, setRelativeWordlist] = useState<string[]>([]);

    // function: ナビゲート関数
    const navigate = useNavigate();

    // function: get search board list response 処理関数
    const getSearchBoardListResponse = (responseBody: GetSearchBoardListResponseDto | ResponseDto | null) => {
        if (!responseBody) return;
        const { code } = responseBody;

        if (code === 'DBE')
            alert('データベースエラーが発生しました。');

        if (code !== 'SU')
            return;

        if (!searchWord) return;
        const { searchList } = responseBody as GetSearchBoardListResponseDto;

        setTotalList(searchList);
        setSearchBoardCount(searchList.length);
        setPreSearchWord(searchWord);
    };

    // function: get relation list response 処理関数
    const getRelationListResponse = (responseBody: GetRelationListResponseDto | ResponseDto | null) => {
        if (!responseBody) return;

        const { code } = responseBody;
        if (code === 'DBE')
            alert('データベースエラーが発生しました。');

        if (code !== 'SU')
            return;

        const { relativeWordList } = responseBody as GetRelationListResponseDto;
        setRelativeWordlist(relativeWordList || []);
    };

    // event handler: 関連キーワードクリックイベント処理
    const onClickRelationWordHandler = (word: string) => {
        navigate(SEARCH_PATH(word));
    };

    // effect: search word 状態変更時に実行される関数
    useEffect(() => {
        if (!searchWord) return;
        getSearchBoardListRequest(searchWord, preSearchWord).then(getSearchBoardListResponse);
        getRelationListRequest(searchWord).then(getRelationListResponse);
    }, [searchWord]);

    // render: 検索画面コンポーネントのレンダリング
    if (!searchWord) return (<></>);
    return (
        <div id='search-wrapper'>
            <div className='search-container'>
                <div className='search-title-box'>
                    <div className='search-title'>
                        <span className='emphasis'>{searchWord}</span>
                        {' の検索結果です。'}
                    </div>
                    <div className='search-count'>{searchBoardCount}件</div>
                </div>

                <div className='search-contents-box'>
                    {searchBoardCount === 0 ? (
                        <div className='search-contents-nothing'>
                            {'該当する検索結果はありません。'}
                        </div>
                    ) : (
                        <div className='search-contents'>
                            {viewList.map(boardListItem => (
                                <BoardItem boardListItem={boardListItem} />
                            ))}
                        </div>
                    )}

                    <div className='search-relation-box'>
                        <div className='search-relation-card'>
                            <div className='search-relation-card-container'>
                                <div className='search-relation-card-title'>{'関連キーワード'}</div>
                                <div className='search-relation-card-content'>
                                    {relativeWordlist.length === 0 ? (
                                        <div className='search-relation-card-contents-nothing'>
                                            {'関連キーワードが\n見つかりませんでした。'}
                                        </div>
                                    ) : (
                                        <div className='search-relation-card-contents'>
                                            {relativeWordlist.map(word => (
                                                <div
                                                    className='word-badge'
                                                    onClick={() => onClickRelationWordHandler(word)}
                                                >
                                                    {word}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='search-pagination-box'>
                    {searchBoardCount !== 0 && (
                        <Pagination
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            currentSection={currentSection}
                            setCurrentSection={setCurrentSection}
                            viewPageList={viewPageList}
                            totalSection={totalSection}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}