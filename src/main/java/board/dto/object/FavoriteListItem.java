package board.dto.object;

import board.repository.resultSet.GetFavoriteListResultSet;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteListItem {
    private String email;
    private String nickname;
    private String profileImage;

    public FavoriteListItem(GetFavoriteListResultSet resultSet) {
        email = resultSet.getEmail();
        nickname = resultSet.getNickname();
        profileImage = resultSet.getProfileImage();
    }

    public static List<FavoriteListItem> copyList(List<GetFavoriteListResultSet> resultSetList) {
        List<FavoriteListItem> list = new ArrayList<>();
        for (GetFavoriteListResultSet resultSet : resultSetList) {
            FavoriteListItem item = new FavoriteListItem(resultSet);
            list.add(item);
        }
        return list;
    }
}
