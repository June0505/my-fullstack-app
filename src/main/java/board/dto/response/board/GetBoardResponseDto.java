package board.dto.response.board;

import board.common.ResponseCode;
import board.common.ResponseMessage;
import board.dto.response.ResponseDto;
import board.entity.ImageEntity;
import board.repository.resultSet.GetBoardResultSet;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

@Getter
public class GetBoardResponseDto extends ResponseDto {

    private int boardNumber;
    private String title;
    private String content;
    private List<String> boardImageList;
    private String writerEmail;
    private String writeDatetime;
    private String writerNickname;
    private String writerProfileImage;

    private GetBoardResponseDto(GetBoardResultSet resultSet, List<ImageEntity> imageEntities) {
        super(ResponseCode.SUCCESS, ResponseMessage.SUCCESS);

        List<String> boardImages = new ArrayList<>();
        for (ImageEntity imageEntity : imageEntities) {
            boardImages.add(imageEntity.getImage());
        }

        boardNumber = resultSet.getBoardNumber();
        title = resultSet.getTitle();
        content = resultSet.getContent();
        boardImageList = boardImages;
        writerEmail = resultSet.getWriterEmail();
        writeDatetime = resultSet.getWriteDatetime();
        writerNickname = resultSet.getWriterNickname();
        writerProfileImage = resultSet.getWriterProfileImage();
    }

    public static ResponseEntity<GetBoardResponseDto> success(GetBoardResultSet resultSet, List<ImageEntity> imageEntities) {
        GetBoardResponseDto result = new GetBoardResponseDto(resultSet, imageEntities);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    public static ResponseEntity<ResponseDto> notExistBoard() {
        ResponseDto result = new ResponseDto(ResponseCode.NOT_EXISTED_BOARD, ResponseMessage.NOT_EXISTED_BOARD);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

}
