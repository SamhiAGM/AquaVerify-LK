package lk.aquaverify.repository;

import lk.aquaverify.entity.WaterSource;
import lk.aquaverify.entity.WaterSourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaterSourceRepository extends JpaRepository<WaterSource, Long> {

    Page<WaterSource> findByDistrict(String district, Pageable pageable);

    Page<WaterSource> findBySourceType(WaterSourceType sourceType, Pageable pageable);

    long countByDistrict(String district);

    @Query("SELECT s FROM WaterSource s WHERE " +
           "(:district IS NULL OR s.district = :district) AND " +
           "(:sourceType IS NULL OR s.sourceType = :sourceType) AND " +
           "(:search IS NULL OR LOWER(s.sourceName) LIKE :search OR " +
           "LOWER(s.locationDescription) LIKE :search)")
    Page<WaterSource> filterSources(@Param("district") String district,
                                    @Param("sourceType") WaterSourceType sourceType,
                                    @Param("search") String search,
                                    Pageable pageable);

    @Query("SELECT DISTINCT s.district FROM WaterSource s ORDER BY s.district ASC")
    List<String> findDistinctDistricts();
}
