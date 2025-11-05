package board.service.implement;

import board.dto.request.board.PatchBoardRequestDto;
import board.dto.request.board.PostBoardRequestDto;
import board.dto.request.board.PostCommentRequestDto;
import board.dto.response.ResponseDto;
import board.dto.response.board.*;
import board.entity.*;
import board.repository.*;
import board.repository.resultSet.GetBoardResultSet;
import board.repository.resultSet.GetCommentListResultSet;
import board.repository.resultSet.GetFavoriteListResultSet;
import board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;
import java.util.stream.Collectors;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private static final Pattern URL_PATTERN = Pattern.compile("(?i)https?://[^\\s)\\]]+");
    private static final Pattern IMG_TAG_PATTERN = Pattern.compile("<img[^>]*>");
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern MD_IMAGE_PATTERN = Pattern.compile("!\\[[^]]*]\\([^)]*\\)");

    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final ImageRepository imageRepository;
    private final CommentRepository commentRepository;
    private final FavoriteRepository favoriteRepository;
    private final SearchLogRepository searchLogRepository;
    private final BoardListViewRepository boardListViewRepository;

    private static String stripUrlsAndTags(String s) {
        if (s == null) return "";
        // 1) 마크다운 이미지 구문 제거: ![alt](url)
        s = MD_IMAGE_PATTERN.matcher(s).replaceAll("");
        // 2) HTML <img ...> 제거
        s = IMG_TAG_PATTERN.matcher(s).replaceAll("");
        // 3) URL 제거
        s = URL_PATTERN.matcher(s).replaceAll("");
        // 4) 남은 HTML 태그 제거
        s = HTML_TAG_PATTERN.matcher(s).replaceAll("");
        return s;
    }

    private static boolean containsIgnoreCase(String haystack, String needle) {
        if (haystack == null || needle == null) return false;
        return haystack.toLowerCase().contains(needle.toLowerCase());
    }

    @Override
    public ResponseEntity<? super GetBoardResponseDto> getBoard(Integer boardNumber) {

        GetBoardResultSet resultSet;
        List<ImageEntity> imageEntities;

        try {

            resultSet = boardRepository.getBoard(boardNumber);
            if (resultSet == null)
                return GetBoardResponseDto.notExistBoard();

            imageEntities = imageRepository.findByBoardNumber(boardNumber);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetBoardResponseDto.success(resultSet, imageEntities);
    }

    @Override
    public ResponseEntity<? super GetFavoriteListResponseDto> getFavoriteList(Integer boardNumber) {

        List<GetFavoriteListResultSet> resultSets;

        try {

            boolean existedBoard = boardRepository.existsById(boardNumber);
            if (!existedBoard)
                return GetFavoriteListResponseDto.notExistBoard();

            resultSets = favoriteRepository.getFavoriteList(boardNumber);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetFavoriteListResponseDto.success(resultSets);
    }

    @Override
    public ResponseEntity<? super GetCommentListResponseDto> getCommentList(Integer boardNumber) {

        List<GetCommentListResultSet> resultSets;

        try {

            boolean existedBoard = boardRepository.existsByBoardNumber(boardNumber);
            if(!existedBoard)
                return GetCommentListResponseDto.notExistBoard();

            resultSets = commentRepository.getCommentList(boardNumber);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetCommentListResponseDto.success(resultSets);
    }

    @Override
    public ResponseEntity<? super GetLatestBoardListResponseDto> getLatestBoardList() {
        List<BoardListViewEntity> boardListViewEntities;

        try {

            boardListViewEntities = boardListViewRepository.findByOrderByWriteDatetimeDesc();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetLatestBoardListResponseDto.success(boardListViewEntities);
    }

    @Override
    public ResponseEntity<? super GetTop3BoardListResponseDto> getTop3BoardList() {

        List<BoardListViewEntity> boardListViewEntities;

        try {

            Date beforeWeek = Date.from(Instant.now().minus(7, ChronoUnit.DAYS));
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String beforeWeekString = simpleDateFormat.format(beforeWeek);

            boardListViewEntities = boardListViewRepository.findTop3ByWriteDatetimeGreaterThanOrderByFavoriteCountDescCommentCountDescViewCountDescWriteDatetimeDesc(beforeWeekString);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetTop3BoardListResponseDto.success(boardListViewEntities);
    }

    @Override
    public ResponseEntity<? super GetSearchBoardListResponseDto> getSearchBoardList(String searchWord, String preSearchWord) {
        List<BoardListViewEntity> boardListViewEntities;

        try {
            // 1) 일단 기존 방식대로 후보군 조회 (DB에서 제목 또는 본문에 검색어가 포함된 모든 글을 가져옴)
            boardListViewEntities = boardListViewRepository
                .findByTitleContainsOrContentContainsOrderByWriteDatetimeDesc(searchWord, searchWord);

            // 2) 서비스 레이어에서 URL/태그 제거 텍스트 기준으로 재필터링 (핵심 변경 부분)
            final String q = searchWord;
            boardListViewEntities = boardListViewEntities.stream()
                .filter(e -> {
                    String title = e.getTitle();
                    String content = e.getContent();
                    String normalized = stripUrlsAndTags(content); // 태그/URL 제거된 깨끗한 본문

                    // 제목은 그대로 검색 || 정제된 본문으로 검색
                    return containsIgnoreCase(title, q) || containsIgnoreCase(normalized, q);
                })
                .collect(Collectors.toList());

            // 3) 검색 로그 로직은 기존 그대로 유지
            SearchLogEntity searchLogEntity = new SearchLogEntity(searchWord, preSearchWord, false);
            searchLogRepository.save(searchLogEntity);

            boolean relation = preSearchWord != null;
            if (relation) {
                searchLogEntity = new SearchLogEntity(preSearchWord, searchWord, relation);
                searchLogRepository.save(searchLogEntity);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetSearchBoardListResponseDto.success(boardListViewEntities);
    }

    @Override
    public ResponseEntity<? super GetUserBoardListResponseDto> getUserBoardList(String email) {
        List<BoardListViewEntity> boardListViewEntities;

        try {

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GetUserBoardListResponseDto.notExistUser();

            boardListViewEntities = boardListViewRepository.findByWriterEmailOrderByWriteDatetimeDesc(email);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetUserBoardListResponseDto.success(boardListViewEntities);
    }

    @Override
    public ResponseEntity<? super PostBoardResponseDto> postBoard(PostBoardRequestDto dto, String email) {

        try {

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return PostBoardResponseDto.notExistUser();

            BoardEntity boardEntity = new BoardEntity(dto, email);
            boardRepository.save(boardEntity);

            int boardNumber = boardEntity.getBoardNumber();

            List<String> boardImageList = dto.getBoardImageList();
            List<ImageEntity> imageEntities = new ArrayList<>();

            for (String image : boardImageList) {
                ImageEntity imageEntity = new ImageEntity(boardNumber, image);
                imageEntities.add(imageEntity);
            }

            imageRepository.saveAll(imageEntities);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return PostBoardResponseDto.success();
    }

    @Override
    public ResponseEntity<? super PostCommentResponseDto> postComment(PostCommentRequestDto dto, Integer boardNumber, String email) {

        try {
            BoardEntity boardEntity = boardRepository.findByBoardNumber(boardNumber);
            if (boardEntity == null)
                return PostCommentResponseDto.notExistBoard();

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return PostCommentResponseDto.notExistUser();

            CommentEntity commentEntity = new CommentEntity(dto, boardNumber, email);
            commentRepository.save(commentEntity);

            boardEntity.increaseCommentCount();
            boardRepository.save(boardEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PostCommentResponseDto.success();
    }

    @Override
    public ResponseEntity<? super PutFavoriteResponseDto> putFavorite(Integer boardNumber, String email) {

        try {

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return PutFavoriteResponseDto.notExistUser();

            BoardEntity boardEntity = boardRepository.findByBoardNumber(boardNumber);
            if (boardEntity == null)
                return PutFavoriteResponseDto.notExistBoard();

            FavoriteEntity favoriteEntity = favoriteRepository.findByBoardNumberAndUserEmail(boardNumber, email);
            if (favoriteEntity == null) {
                favoriteEntity = new FavoriteEntity(email, boardNumber);
                favoriteRepository.save(favoriteEntity);
                boardEntity.increaseFavoriteCount();
            } else {
                favoriteRepository.delete(favoriteEntity);
                boardEntity.decreaseFavoriteCount();
            }

            boardRepository.save(boardEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return PutFavoriteResponseDto.success();
    }

    @Override
    public ResponseEntity<? super PatchBoardResponseDto> patchBoard(PatchBoardRequestDto dto, Integer boardNumber, String email) {

        try {

            BoardEntity boardEntity = boardRepository.findByBoardNumber(boardNumber);
            if (boardEntity == null)
                return PatchBoardResponseDto.notExistBoard();

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return PatchBoardResponseDto.notExistUser();

            String writerEmail = boardEntity.getWriterEmail();
            boolean isWriter = writerEmail.equals(email);
            if (!isWriter)
                return PatchBoardResponseDto.forbidden();

            boardEntity.patchBoard(dto);
            boardRepository.save(boardEntity);

            imageRepository.deleteByBoardNumber(boardNumber);
            List<String> boardImageList = dto.getBoardImageList();
            List<ImageEntity> imageEntities = new ArrayList<>();

            for (String boardImage : boardImageList) {
                ImageEntity imageEntity = new ImageEntity(boardNumber, boardImage);
                imageEntities.add(imageEntity);
            }

            imageRepository.saveAll(imageEntities);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return PatchBoardResponseDto.success();
    }

    @Override
    public ResponseEntity<? super IncreaseViewCountResponseDto> increaseViewCount(Integer boardNumber) {

        try {

            BoardEntity boardEntity = boardRepository.findByBoardNumber(boardNumber);
            if (boardEntity == null)
                return IncreaseViewCountResponseDto.notExistBoard();

            boardEntity.increaseViewCount();
            boardRepository.save(boardEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return IncreaseViewCountResponseDto.success();
    }

    @Override
    public ResponseEntity<? super DeleteBoardResponseDto> deleteBoard(Integer boardNumber, String email) {

        try {

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return DeleteBoardResponseDto.notExistUser();

            BoardEntity boardEntity = boardRepository.findByBoardNumber(boardNumber);
            if (boardEntity == null)
                return DeleteBoardResponseDto.notExistBoard();

            String writerEmail = boardEntity.getWriterEmail();
            boolean isWriter = writerEmail.equals(email);
            if (!isWriter)
                return DeleteBoardResponseDto.forbidden();

            imageRepository.deleteByBoardNumber(boardNumber);
            commentRepository.deleteByBoardNumber(boardNumber);
            favoriteRepository.deleteByBoardNumber(boardNumber);

            boardRepository.delete(boardEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return DeleteBoardResponseDto.success();
    }

}