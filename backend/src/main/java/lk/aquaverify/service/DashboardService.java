package lk.aquaverify.service;

import lk.aquaverify.dto.response.*;
import lk.aquaverify.entity.ComplaintCategory;
import lk.aquaverify.entity.ComplaintStatus;
import lk.aquaverify.entity.Role;
import lk.aquaverify.entity.User;
import lk.aquaverify.entity.VerificationStatus;
import lk.aquaverify.exception.ForbiddenException;
import lk.aquaverify.exception.ResourceNotFoundException;
import lk.aquaverify.repository.*;
import lk.aquaverify.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final WaterTestRepository waterTestRepository;
    private final WaterSourceRepository waterSourceRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardService(ComplaintRepository complaintRepository,
                            WaterTestRepository waterTestRepository,
                            WaterSourceRepository waterSourceRepository,
                            UserRepository userRepository,
                            AuditLogRepository auditLogRepository) {
        this.complaintRepository = complaintRepository;
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

    @Transactional(readOnly = true)
    public PublicDashboardStatsResponse getPublicStats() {
        long totalComplaints = complaintRepository.countByDeletedAtIsNull();
        long resolvedComplaints = complaintRepository.countByStatusAndDeletedAtIsNull(ComplaintStatus.RESOLVED);
        long testsRecorded = waterTestRepository.count();
        long sources = waterSourceRepository.count();
        long districtCount = waterSourceRepository.findDistinctDistricts().size();

        return new PublicDashboardStatsResponse(
                totalComplaints,
                resolvedComplaints,
                testsRecorded,
                sources,
                districtCount
        );
    }

    @Transactional(readOnly = true)
    public CitizenDashboardResponse getCitizenDashboard() {
        User citizen = getAuthenticatedUser();

        long myTotal = complaintRepository.countByCitizenIdAndDeletedAtIsNull(citizen.getId());
        long pending = complaintRepository.countByCitizenIdAndStatusAndDeletedAtIsNull(citizen.getId(), ComplaintStatus.PENDING);
        long inProgress = complaintRepository.countByCitizenIdAndStatusAndDeletedAtIsNull(citizen.getId(), ComplaintStatus.UNDER_INVESTIGATION)
                + complaintRepository.countByCitizenIdAndStatusAndDeletedAtIsNull(citizen.getId(), ComplaintStatus.TESTING_REQUESTED);
        long resolved = complaintRepository.countByCitizenIdAndStatusAndDeletedAtIsNull(citizen.getId(), ComplaintStatus.RESOLVED);

        Pageable recentComplaintsPage = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<ComplaintResponse> recentComplaints = complaintRepository
                .filterComplaints(citizen.getId(), null, null, null, null, null, recentComplaintsPage)
                .getContent().stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());

        Pageable testsPage = PageRequest.of(0, 4, Sort.by("sampleDate").descending());
        List<WaterTestResponse> nearbyVerifiedTests = waterTestRepository
                .filterTests(VerificationStatus.VERIFIED, null, null, citizen.getDistrict(), null, testsPage)
                .getContent().stream()
                .map(WaterTestResponse::fromEntity)
                .collect(Collectors.toList());

        return new CitizenDashboardResponse(
                myTotal,
                pending,
                inProgress,
                resolved,
                recentComplaints,
                nearbyVerifiedTests
        );
    }

    @Transactional(readOnly = true)
    public OfficerDashboardResponse getOfficerDashboard() {
        User officer = getAuthenticatedUser();

        long assigned = complaintRepository.countByAssignedOfficerIdAndDeletedAtIsNull(officer.getId());
        long pending = complaintRepository.countByAssignedOfficerIdAndStatusAndDeletedAtIsNull(officer.getId(), ComplaintStatus.PENDING);
        long investigation = complaintRepository.countByAssignedOfficerIdAndStatusAndDeletedAtIsNull(officer.getId(), ComplaintStatus.UNDER_INVESTIGATION)
                + complaintRepository.countByAssignedOfficerIdAndStatusAndDeletedAtIsNull(officer.getId(), ComplaintStatus.TESTING_REQUESTED);
        long resolved = complaintRepository.countByAssignedOfficerIdAndStatusAndDeletedAtIsNull(officer.getId(), ComplaintStatus.RESOLVED);

        Map<String, Long> categoryMap = new HashMap<>();
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            categoryMap.put(cat.name(), complaintRepository.filterComplaints(null, officer.getId(), null, cat, null, null, PageRequest.of(0, 1)).getTotalElements());
        }

        Pageable recentPage = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<ComplaintResponse> recentAssigned = complaintRepository
                .filterComplaints(null, officer.getId(), null, null, null, null, recentPage)
                .getContent().stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());

        return new OfficerDashboardResponse(
                assigned,
                pending,
                investigation,
                resolved,
                categoryMap,
                recentAssigned
        );
    }

    @Transactional(readOnly = true)
    public LabDashboardResponse getLabDashboard() {
        User technician = getAuthenticatedUser();

        long totalSamples = waterTestRepository.count();
        long pendingVerification = waterTestRepository.countByVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        long verified = waterTestRepository.countByVerificationStatus(VerificationStatus.VERIFIED);
        long draft = waterTestRepository.countByVerificationStatus(VerificationStatus.DRAFT);

        Pageable recentPage = PageRequest.of(0, 6, Sort.by("createdAt").descending());
        List<WaterTestResponse> recentTests = waterTestRepository
                .filterTests(null, null, technician.getId(), null, null, recentPage)
                .getContent().stream()
                .map(WaterTestResponse::fromEntity)
                .collect(Collectors.toList());

        return new LabDashboardResponse(
                totalSamples,
                pendingVerification,
                verified,
                draft,
                recentTests
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        long registeredUsers = userRepository.count();
        long activeComplaints = complaintRepository.countByStatusAndDeletedAtIsNull(ComplaintStatus.PENDING)
                + complaintRepository.countByStatusAndDeletedAtIsNull(ComplaintStatus.UNDER_INVESTIGATION)
                + complaintRepository.countByStatusAndDeletedAtIsNull(ComplaintStatus.TESTING_REQUESTED);
        long resolvedComplaints = complaintRepository.countByStatusAndDeletedAtIsNull(ComplaintStatus.RESOLVED);
        long sources = waterSourceRepository.count();
        long tests = waterTestRepository.count();

        Map<String, Long> usersByRole = new HashMap<>();
        for (Role role : Role.values()) {
            usersByRole.put(role.name(), userRepository.countByRole(role));
        }

        Map<String, Long> complaintsByStatus = new HashMap<>();
        for (ComplaintStatus status : ComplaintStatus.values()) {
            complaintsByStatus.put(status.name(), complaintRepository.countByStatusAndDeletedAtIsNull(status));
        }

        Map<String, Long> complaintsByCategory = new HashMap<>();
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            complaintsByCategory.put(cat.name(), complaintRepository.filterComplaints(null, null, null, cat, null, null, PageRequest.of(0, 1)).getTotalElements());
        }

        Map<String, Long> sourcesByDistrict = new HashMap<>();
        List<String> districts = waterSourceRepository.findDistinctDistricts();
        for (String dist : districts) {
            sourcesByDistrict.put(dist, waterSourceRepository.countByDistrict(dist));
        }

        Pageable auditPage = PageRequest.of(0, 8, Sort.by("createdAt").descending());
        List<AdminDashboardResponse.AuditLogResponse> recentActivity = auditLogRepository
                .findAllByOrderByCreatedAtDesc(auditPage)
                .getContent().stream()
                .map(log -> new AdminDashboardResponse.AuditLogResponse(
                        log.getId(),
                        log.getActor() != null ? log.getActor().getFullName() : "System",
                        log.getActor() != null ? log.getActor().getEmail() : "system@aquaverify.lk",
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getDetails(),
                        log.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());

        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setRegisteredUsers(registeredUsers);
        response.setActiveComplaints(activeComplaints);
        response.setResolvedComplaints(resolvedComplaints);
        response.setWaterSources(sources);
        response.setRecordedTests(tests);
        response.setUsersByRole(usersByRole);
        response.setComplaintsByStatus(complaintsByStatus);
        response.setComplaintsByCategory(complaintsByCategory);
        response.setSourcesByDistrict(sourcesByDistrict);
        response.setRecentActivity(recentActivity);

        return response;
    }
}
