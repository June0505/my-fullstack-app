package board.dto.object;

import board.repository.resultSet.GetCommentListResultSet;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentListItem {
    private String nickname;
    private String ProfileImage;
    private String writeDatetime;
    private String content;

    public CommentListItem(GetCommentListResultSet resultSet) {
        nickname = resultSet.getNickname();
        ProfileImage = resultSet.getProfileImage();
        writeDatetime = resultSet.getWriteDatetime();
        content = resultSet.getContent();
    }

    public static List<CommentListItem> copyList(List<GetCommentListResultSet> resultSets) {
        List<CommentListItem> list = new ArrayList<>();
        for (GetCommentListResultSet resultSet : resultSets) {
            CommentListItem item = new CommentListItem(resultSet);
            list.add(item);
        }
        return list;
    }
}
