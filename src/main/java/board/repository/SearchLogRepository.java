package board.repository;

import board.entity.SearchLogEntity;
import board.repository.resultSet.GetPopularListResultSet;
import board.repository.resultSet.GetRelationListResultSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLogEntity, Integer> {
    @Query(
        value =
        "SELECT search_word AS searchWord, COUNT(search_word) AS count " +
        "FROM `search_log` " +
        "WHERE relation IS FALSE " +
        "GROUP BY search_word " +
        "ORDER BY count DESC " +
        "LIMIT 15",
        nativeQuery = true
    )
    List<GetPopularListResultSet> getPopularList();

    @Query(
        value =
        "SELECT relation_word AS searchWord, COUNT(relation_word) AS count " +
        "FROM `search_log` " +
        "WHERE search_word = ?1 " +
        "AND relation_word IS NOT NULL " +
        "GROUP BY relation_word " +
        "ORDER BY count DESC " +
        "LIMIT 15 ",
        nativeQuery = true
    )
    List<GetRelationListResultSet> getRelationList(String searchWord);
}
