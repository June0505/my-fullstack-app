package board.dto.object;

import board.entity.BoardListViewEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BoardListItem {

    private int boardNumber;
    private String title;
    private String content;
    private String boardTitleImage;
    private int favoriteCount;
    private int commentCount;
    private int viewCount;
    private String writeDatetime;
    private String writerNickname;
    private String writerProfileImage;

    public BoardListItem(BoardListViewEntity boardListViewEntity) {
        boardNumber = boardListViewEntity.getBoardNumber();
        title = boardListViewEntity.getTitle();
        content = boardListViewEntity.getContent();
        boardTitleImage = boardListViewEntity.getTitleImage();
        favoriteCount = boardListViewEntity.getFavoriteCount();
        commentCount = boardListViewEntity.getCommentCount();
        viewCount = boardListViewEntity.getViewCount();
        writeDatetime = boardListViewEntity.getWriteDatetime();
        writerNickname = boardListViewEntity.getWriterNickname();
        writerProfileImage = boardListViewEntity.getWriterProfileImage();
    }

    public static List<BoardListItem> getList(List<BoardListViewEntity> boardListViewEntities) {
        List<BoardListItem> list = new ArrayList<>();
        for (BoardListViewEntity boardListViewEntity : boardListViewEntities) {
            BoardListItem item = new BoardListItem(boardListViewEntity);
            list.add(item);
        }
        return list;
    }
}
