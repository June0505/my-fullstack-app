package board.dto.response.search;

import board.common.ResponseCode;
import board.common.ResponseMessage;
import board.dto.response.ResponseDto;
import board.repository.resultSet.GetPopularListResultSet;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

@Getter
public class GetPopularListResponseDto extends ResponseDto {

    private List<String> popularWordList;

    private GetPopularListResponseDto(List<GetPopularListResultSet> resultSets) {
        super(ResponseCode.SUCCESS, ResponseMessage.SUCCESS);

        List<String> popularWordList = new ArrayList<>();
        for (GetPopularListResultSet resultSet : resultSets) {
            String popularWord = resultSet.getSearchWord();
            popularWordList.add(popularWord);
        }

        this.popularWordList = popularWordList;
    }

    public static ResponseEntity<GetPopularListResponseDto> success(List<GetPopularListResultSet> resultSets) {
        GetPopularListResponseDto result = new GetPopularListResponseDto(resultSets);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
