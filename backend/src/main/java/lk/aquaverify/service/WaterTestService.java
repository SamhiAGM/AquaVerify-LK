package lk.aquaverify.service;

import lk.aquaverify.dto.request.WaterTestCreateRequest;
import lk.aquaverify.dto.request.WaterTestUpdateRequest;
import lk.aquaverify.dto.request.WaterTestVerifyRequest;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.dto.response.WaterTestResponse;
import lk.aquaverify.entity.*;
import lk.aquaverify.exception.BadRequestException;
import lk.aquaverify.exception.ForbiddenException;
import lk.aquaverify.exception.ResourceNotFoundException;
import lk.aquaverify.repository.AuditLogRepository;
import lk.aquaverify.repository.UserRepository;
import lk.aquaverify.repository.WaterSourceRepository;
import lk.aquaverify.repository.WaterTestRepository;
import lk.aquaverify.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaterTestService {

    private final WaterTestRepository waterTestRepository;
    private final WaterSourceRepository waterSourceRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public WaterTestService(WaterTestRepository waterTestRepository,
                            WaterSourceRepository waterSourceRepository,
                            UserRepository userRepository,
                            AuditLogRepository auditLogRepository) {
        this.waterTestRepository = waterTestRepository;
        this.waterSourceRepository = waterSourceRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }
        throw new ForbiddenException("Authentication required");
    }

    @Transactional
    public WaterTestResponse createTest(WaterTestCreateRequest request) {
        User technician = getAuthenticatedUser();
        if (technician.getRole() != Role.LAB_TECHNICIAN && technician.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only laboratory technicians or administrators can record water-test records.");
        }

        WaterSource source = waterSourceRepository.findById(request.getWaterSourceId())
                .orElseThrow(() -> new ResourceNotFoundException("WaterSource", "id", request.getWaterSourceId()));

        WaterTest test = new WaterTest(
                source,
                technician,
                request.getSampleDate(),
                request.getPhValue(),
                request.getTurbidityNtu(),
                request.getLaboratoryReference().trim()
        );

        test.setTdsPpm(request.getTdsPpm());
        test.setConductivityUsCm(request.getConductivityUsCm());
        test.setNitrateMgL(request.getNitrateMgL());
        test.seteColiPresence(request.geteColiPresence());

        if (request.isSubmitForVerification()) {
            test.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        } else {
            test.setVerificationStatus(VerificationStatus.DRAFT);
        }

        WaterTest saved = waterTestRepository.save(test);

        auditLogRepository.save(new AuditLog(
                technician,
                "RECORD_WATER_TEST",
                "WATER_TEST",
                saved.getId().toString(),
                "Lab technician logged test " + saved.getLaboratoryReference() + " for source " + source.getSourceName()
        ));

        return WaterTestResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<WaterTestResponse> getTests(VerificationStatus status,
                                                     Long sourceId,
                                                     Long technicianId,
                                                     String district,
                                                     String search,
                                                     int page,
                                                     int size,
                                                     String sortBy,
                                                     String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.trim().toLowerCase() + "%" : null;

        Page<WaterTest> testsPage = waterTestRepository.filterTests(
                status,
                sourceId,
                technicianId,
                district != null && !district.isBlank() ? district.trim() : null,
                searchPattern,
                pageable
        );

        List<WaterTestResponse> content = testsPage.getContent().stream()
                .map(WaterTestResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                testsPage.getNumber(),
                testsPage.getSize(),
                testsPage.getTotalElements(),
                testsPage.getTotalPages(),
                testsPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public WaterTestResponse getTestById(Long id) {
        WaterTest test = waterTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterTest", "id", id));
        return WaterTestResponse.fromEntity(test);
    }

    @Transactional
    public WaterTestResponse updateTest(Long id, WaterTestUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        WaterTest test = waterTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterTest", "id", id));

        // Only technician who created it (if not yet verified) or admin can edit
        if (currentUser.getRole() == Role.LAB_TECHNICIAN) {
            if (!test.getLaboratoryTechnician().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You cannot edit a test record created by another technician.");
            }
            if (test.getVerificationStatus() == VerificationStatus.VERIFIED) {
                throw new BadRequestException("Verified laboratory reports cannot be altered by technicians. Contact an Administrator.");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You are not authorized to modify laboratory records.");
        }

        test.setSampleDate(request.getSampleDate());
        test.setPhValue(request.getPhValue());
        test.setTurbidityNtu(request.getTurbidityNtu());
        test.setTdsPpm(request.getTdsPpm());
        test.setConductivityUsCm(request.getConductivityUsCm());
        test.setNitrateMgL(request.getNitrateMgL());
        test.seteColiPresence(request.geteColiPresence());
        test.setLaboratoryReference(request.getLaboratoryReference().trim());

        if (request.isSubmitForVerification()) {
            test.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        }

        WaterTest updated = waterTestRepository.save(test);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "UPDATE_WATER_TEST",
                "WATER_TEST",
                updated.getId().toString(),
                "Updated laboratory record " + updated.getLaboratoryReference()
        ));

        return WaterTestResponse.fromEntity(updated);
    }

    @Transactional
    public WaterTestResponse verifyTest(Long id, WaterTestVerifyRequest request) {
        User reviewer = getAuthenticatedUser();
        if (reviewer.getRole() != Role.ADMIN && reviewer.getRole() != Role.OFFICER) {
            throw new ForbiddenException("Only administrators and water quality officers have verification authority.");
        }

        WaterTest test = waterTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterTest", "id", id));

        test.setVerificationStatus(request.getStatus());
        test.setVerifiedBy(reviewer);
        test.setVerifiedAt(Instant.now());

        WaterTest saved = waterTestRepository.save(test);

        String note = request.getReviewNote() != null ? " Review note: " + request.getReviewNote() : "";
        auditLogRepository.save(new AuditLog(
                reviewer,
                "VERIFY_WATER_TEST",
                "WATER_TEST",
                saved.getId().toString(),
                "Test status set to " + request.getStatus().name() + " by " + reviewer.getFullName() + "." + note
        ));

        return WaterTestResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteTest(Long id) {
        User currentUser = getAuthenticatedUser();
        WaterTest test = waterTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterTest", "id", id));

        if (currentUser.getRole() == Role.LAB_TECHNICIAN) {
            if (!test.getLaboratoryTechnician().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You cannot delete test records from another technician.");
            }
            if (test.getVerificationStatus() != VerificationStatus.DRAFT) {
                throw new BadRequestException("Only test records in DRAFT status can be deleted by laboratory technicians.");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can delete non-draft test records.");
        }

        waterTestRepository.delete(test);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "DELETE_WATER_TEST",
                "WATER_TEST",
                id.toString(),
                "Deleted test record " + test.getLaboratoryReference()
        ));
    }

    @Transactional(readOnly = true)
    public PagedResponse<WaterTestResponse> getVerifiedTests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sampleDate").descending());
        Page<WaterTest> verifiedPage = waterTestRepository.findByVerificationStatus(VerificationStatus.VERIFIED, pageable);

        List<WaterTestResponse> content = verifiedPage.getContent().stream()
                .map(WaterTestResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                verifiedPage.getNumber(),
                verifiedPage.getSize(),
                verifiedPage.getTotalElements(),
                verifiedPage.getTotalPages(),
                verifiedPage.isLast()
        );
    }
}
