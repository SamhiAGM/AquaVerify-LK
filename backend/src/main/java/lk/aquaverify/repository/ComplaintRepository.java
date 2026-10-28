package lk.aquaverify.repository;

import lk.aquaverify.entity.Complaint;
import lk.aquaverify.entity.ComplaintCategory;
import lk.aquaverify.entity.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByComplaintReferenceAndDeletedAtIsNull(String complaintReference);

    Optional<Complaint> findByIdAndDeletedAtIsNull(Long id);

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(ComplaintStatus status);

    long countByCitizenIdAndDeletedAtIsNull(Long citizenId);

    long countByCitizenIdAndStatusAndDeletedAtIsNull(Long citizenId, ComplaintStatus status);

    long countByAssignedOfficerIdAndDeletedAtIsNull(Long officerId);

    long countByAssignedOfficerIdAndStatusAndDeletedAtIsNull(Long officerId, ComplaintStatus status);

    @Query("SELECT c FROM Complaint c LEFT JOIN c.waterSource ws WHERE c.deletedAt IS NULL AND " +
           "(:citizenId IS NULL OR c.citizen.id = :citizenId) AND " +
           "(:officerId IS NULL OR c.assignedOfficer.id = :officerId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR c.complaintCategory = :category) AND " +
           "(:district IS NULL OR c.citizen.district = :district OR (ws IS NOT NULL AND ws.district = :district)) AND " +
           "(:search IS NULL OR LOWER(c.complaintReference) LIKE :search OR " +
           "LOWER(c.title) LIKE :search OR " +
           "LOWER(c.description) LIKE :search)")
    Page<Complaint> filterComplaints(@Param("citizenId") Long citizenId,
                                     @Param("officerId") Long officerId,
                                     @Param("status") ComplaintStatus status,
                                     @Param("category") ComplaintCategory category,
                                     @Param("district") String district,
                                     @Param("search") String search,
                                     Pageable pageable);
}
