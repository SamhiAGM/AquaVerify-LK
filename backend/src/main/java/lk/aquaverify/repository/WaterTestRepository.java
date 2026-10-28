package lk.aquaverify.repository;

import lk.aquaverify.entity.VerificationStatus;
import lk.aquaverify.entity.WaterTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaterTestRepository extends JpaRepository<WaterTest, Long> {

    Page<WaterTest> findByWaterSourceId(Long waterSourceId, Pageable pageable);

    Page<WaterTest> findByLaboratoryTechnicianId(Long laboratoryTechnicianId, Pageable pageable);

    Page<WaterTest> findByVerificationStatus(VerificationStatus verificationStatus, Pageable pageable);

    long countByVerificationStatus(VerificationStatus verificationStatus);

    @Query("SELECT t FROM WaterTest t JOIN t.waterSource ws WHERE " +
           "(:status IS NULL OR t.verificationStatus = :status) AND " +
           "(:sourceId IS NULL OR ws.id = :sourceId) AND " +
           "(:technicianId IS NULL OR t.laboratoryTechnician.id = :technicianId) AND " +
           "(:district IS NULL OR ws.district = :district) AND " +
           "(:search IS NULL OR LOWER(t.laboratoryReference) LIKE :search OR " +
           "LOWER(ws.sourceName) LIKE :search)")
    Page<WaterTest> filterTests(@Param("status") VerificationStatus status,
                                @Param("sourceId") Long sourceId,
                                @Param("technicianId") Long technicianId,
                                @Param("district") String district,
                                @Param("search") String search,
                                Pageable pageable);

    @Query("SELECT t FROM WaterTest t WHERE t.verificationStatus = 'VERIFIED' ORDER BY t.sampleDate DESC")
    List<WaterTest> findRecentVerifiedTests(Pageable pageable);
}
