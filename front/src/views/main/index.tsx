import React, { useEffect, useState } from 'react';
import './style.css';
import Top3Items from "../../components/Top3Items";
import BoardItem from "../../components/BoardItem";
import Pagination from "../../components/pagination";
import { BoardListItem } from "../../types/interface";
import { useNavigate } from "react-router-dom";
import { SEARCH_PATH } from "../../constants";
import { usePagination } from "../../hooks";
import {
    getLatestBoardListRequest,
    getPopularListRequest,
    getTop3BoardListRequest
} from "../../apis";
import {
    GetLatestBoardListResponseDto,
    GetTop3BoardListResponseDto
} from "../../apis/response/board";
import { ResponseDto } from "../../apis/response";
import {GetPopularListResponseDto} from "../../apis/response/search";

// component: メインページコンポーネント
export default function Main() {

    // component: 上部エリア
    const MainTop = () => {
        const [top3BoardList, setTop3BoardList] = useState<BoardListItem[]>([]);

        const getTop3BoardListResponse = (responseBody: GetTop3BoardListResponseDto | ResponseDto | null) => {
            if (!responseBody) return;
            const { code } = responseBody;
            if (code === 'DBE') alert('データベースエラーが発生しました。');
            if (code !== 'SU') return;
            const { top3List } = responseBody as GetTop3BoardListResponseDto;
            setTop3BoardList(top3List);
        }

        useEffect(() => {
            getTop3BoardListRequest().then(getTop3BoardListResponse);
        }, []);

        return (
            <div id='main-top-wrapper'>
                <div className='main-top-container fade-slide'>
                    <div className='main-top-title'>
                        {'Open Blogで\n自分のストーリーを共有しよう｡'}
                    </div>
                    <div className='main-top-contents-box'>
                        <div className='main-top-contents-title'>{'週間人気記事ランキング TOP3'}</div>
                        <div className='main-top-contents'>
                            {top3BoardList.map(item => <Top3Items top3ListItem={item} key={item.boardNumber} />)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // component: 下部エリア
    const MainBottom = () => {
        const navigate = useNavigate();
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

        const [popularWordList, setPopularWordList] = useState<string[]>([]);

        const onClickPopularWordHandler = (word: string) => {
            navigate(SEARCH_PATH(word));
        }

        const getLatestBoardListResponse = (responseBody: GetLatestBoardListResponseDto | ResponseDto | null) => {
            if (!responseBody) return;
            const { code } = responseBody;
            if (code === 'DBE') alert('データベースエラーが発生しました。');
            if (code !== 'SU') return;
            const { latestList } = responseBody as GetLatestBoardListResponseDto;
            setTotalList(latestList);
        }

        const getPopularListResponse = (responseBody: GetPopularListResponseDto | ResponseDto | null) => {
            if (!responseBody) return;
            const { code } = responseBody;
            if (code === 'DBE') alert('データベースエラーが発生しました。');
            if (code !== 'SU') return;
            const { popularWordList } = responseBody as GetPopularListResponseDto;
            setPopularWordList(popularWordList);
        }

        useEffect(() => {
            getLatestBoardListRequest().then(getLatestBoardListResponse);
            getPopularListRequest().then(getPopularListResponse);
        }, []);

        return (
            <div id='main-bottom-wrapper'>
                <div className='main-bottom-container fade-slide'>
                    <div className='main-bottom-title'>{'最新の投稿'}</div>
                    <div className='main-bottom-contents-box'>
                        <div className='main-bottom-current-contents'>
                            {viewList.map(item => <BoardItem boardListItem={item} key={item.boardNumber} />)}
                        </div>
                        <div className='main-bottom-popular-box'>
                            <div className='main-bottom-popular-card'>
                                <div className='main-bottom-popular-card-container'>
                                    <div className='main-bottom-popular-card-title'>{'人気ワード'}</div>
                                    <div className='main-bottom-popular-card-contents'>
                                        {popularWordList.map(word => (
                                            <div
                                                className='word-badge'
                                                key={word}
                                                onClick={() => onClickPopularWordHandler(word)}
                                            >
                                                {word}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='main-bottom-pagination-box'>
                        <Pagination
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            currentSection={currentSection}
                            setCurrentSection={setCurrentSection}
                            viewPageList={viewPageList}
                            totalSection={totalSection}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <MainTop />
            <MainBottom />
        </>
    );
}
