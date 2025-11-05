package board.entity;

import board.dto.request.board.PatchBoardRequestDto;
import board.dto.request.board.PostBoardRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "board")
@Table(name = "board")
public class BoardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int boardNumber;

    private String title;
    private String content;
    private String writeDatetime;
    private int favoriteCount;
    private int commentCount;
    private int viewCount;
    private String writerEmail;

    public BoardEntity(PostBoardRequestDto dto, String email) {

        Date now = Date.from(Instant.now());
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String writeDatetime = simpleDateFormat.format(now);

        this.title = dto.getTitle();
        this.content = dto.getContent();
        this.writeDatetime = writeDatetime;
        this.favoriteCount = 0;
        this.commentCount = 0;
        this.viewCount = 0;
        this.writerEmail = email;
    }

    public void increaseViewCount() {
        viewCount++;
    }

    public void increaseFavoriteCount() {
        favoriteCount++;
    }

    public void decreaseFavoriteCount() {
        favoriteCount--;
    }

    public void increaseCommentCount() {
        commentCount++;
    }

    public void decreaseCommentCount() {
        commentCount--;
    }

    public void patchBoard(PatchBoardRequestDto dto) {
        title = dto.getTitle();
        content = dto.getContent();
    }

}
