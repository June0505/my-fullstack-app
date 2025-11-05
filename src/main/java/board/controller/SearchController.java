package board.controller;

import board.dto.response.search.GetPopularListResponseDto;
import board.dto.response.search.GetRelationListResponseDto;
import board.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping( "/popular-list")
    public ResponseEntity<? super GetPopularListResponseDto> getPopularList() {
        return searchService.getPopularList();
    }

    @GetMapping( "/{searchWord}/relation-list")
    public ResponseEntity<? super GetRelationListResponseDto> getRelationList(
        @PathVariable("searchWord") String searchWord
    ) {
        return searchService.getRelationList(searchWord);
    }
}
