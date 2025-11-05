package board.service.implement;

import board.dto.response.ResponseDto;
import board.dto.response.search.GetPopularListResponseDto;
import board.dto.response.search.GetRelationListResponseDto;
import board.repository.SearchLogRepository;
import board.repository.resultSet.GetPopularListResultSet;
import board.repository.resultSet.GetRelationListResultSet;
import board.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final SearchLogRepository searchLogRepository;

    @Override
    public ResponseEntity<? super GetPopularListResponseDto> getPopularList() {
        List<GetPopularListResultSet> resultSets;

        try {
            resultSets = searchLogRepository.getPopularList();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetPopularListResponseDto.success(resultSets);
    }

    @Override
    public ResponseEntity<? super GetRelationListResponseDto> getRelationList(String searchWord) {
        List<GetRelationListResultSet> resultSets;

        try {
            resultSets = searchLogRepository.getRelationList(searchWord);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetRelationListResponseDto.success(resultSets);
    }

}
