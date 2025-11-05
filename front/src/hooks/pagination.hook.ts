import {useEffect, useState} from "react";

const usePagination = <T>(countPerPage: number) => {

    // state: 全リストのオブジェクト状態
    const [totalList, setTotalList] = useState<T[]>([]);
    // state: 表示するリストのオブジェクト状態
    const [viewList, setViewList] = useState<T[]>([]);
    // state: 現在のページ番号の状態
    const [currentPage, setCurrentPage] = useState<number>(1);
    // state: 全ページ番号リストの状態
    const [totalPageList, setTotalPageList] = useState<number[]>([1]);
    // state: 表示するページ番号リストの状態
    const [viewPageList, setViewPageList] = useState<number[]>([1]);
    // state: 現在のセクションの状態
    const [currentSection, setCurrentSection] = useState<number>(1);
    // state: 全セクション数の状態
    const [totalSection, setTotalSection] = useState<number>(1);

    // effect: 全リストが変更されるたびに実行する処理
    useEffect(() => {
        // 総ページ数を計算 - アイテム数をページあたりのアイテム数で割って切り上げ
        const totalPage = Math.ceil(totalList.length / countPerPage);

        // ページリストの生成
        const totalPageArray: number[] = [];
        for (let page = 1; page <= totalPage; page++) {
            totalPageArray.push(page);
        }
        setTotalPageList(totalPageArray);

        // 総セクション数を計算
        const totalSectionCount = Math.ceil(totalPage / 10);
        setTotalSection(totalSectionCount);

        // ページとセクションの初期化
        setCurrentPage(1);
        setCurrentSection(1);

    }, [totalList, countPerPage])

    // effect: 表示するリストを更新
    useEffect(() => {
        const startIndex = countPerPage * (currentPage - 1);
        const endIndex = startIndex + countPerPage;

        setViewList(totalList.slice(startIndex, endIndex));
    }, [totalList, currentPage, countPerPage]);

    // effect: 表示するページ番号を更新
    useEffect(() => {
        const startIndex = 10 * (currentSection - 1);
        const endIndex = startIndex + 10;

        setViewPageList(totalPageList.slice(startIndex, endIndex));
    }, [totalPageList, currentSection]);

    return {
        currentPage,
        setCurrentPage,
        currentSection,
        setCurrentSection,
        viewList,
        viewPageList,
        totalSection,
        setTotalList
    }
}

export default usePagination;