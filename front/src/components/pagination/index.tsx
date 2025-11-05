import React, {Dispatch, SetStateAction} from 'react'
import './style.css';

// interface: ページネーションコンポーネントのプロパティ
interface Props {
    currentPage: number;
    currentSection: number;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    setCurrentSection: Dispatch<SetStateAction<number>>;

    viewPageList: number[];
    totalSection: number;
}

// component: ページネーションコンポーネント
export default function Pagination(props: Props) {

    // state: プロパティ
    const {currentPage, currentSection, viewPageList, totalSection} = props;
    const {setCurrentPage, setCurrentSection} = props;

    // event handler: ページ番号クリックイベントの処理
    const onClickPageNumberHandler = (page: number) => {
        setCurrentPage(page);
    }

    // event handler: 「前へ」ボタンクリックイベントの処理
    const onClickPrevButtonHandler = () => {
        if (currentSection === 1) return;

        setCurrentPage((currentSection - 1) * 10);
        setCurrentSection(currentSection - 1);
    }

    // event handler: 「次へ」ボタンクリックイベントの処理
    const onClickNextButtonHandler = () => {
        if (currentSection === totalSection) return;

        setCurrentPage(currentSection * 10 + 1);
        setCurrentSection(currentSection + 1);
    }

    // render: ページネーションコンポーネントをレンダリング
    return (
        <div id='pagination-wrapper'>
            <div className='pagination-change-link-box'>
                <div className='icon-box-small'>
                    <div className='icon expand-left-icon'></div>
                </div>
                <div className='pagination-change-link-text' onClick={onClickPrevButtonHandler}>{'前へ'}</div>
            </div>
            <div className='pagination-divider'>{'\|'}</div>

            {viewPageList.map(page => page === currentPage ?
                <div className='pagination-text-active'>{page}</div> :
                <div className='pagination-text' onClick={() => onClickPageNumberHandler(page)}>{page}</div>
            )}
            <div className='pagination-divider'>{'\|'}</div>
            <div className='pagination-change-link-box'>
                <div className='pagination-change-link-text' onClick={onClickNextButtonHandler}>{'次へ'}</div>
                <div className='icon-box-small'>
                    <div className='icon expand-right-icon'></div>
                </div>
            </div>
        </div>
    )
}