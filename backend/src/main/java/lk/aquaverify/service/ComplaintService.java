package lk.aquaverify.service;

import lk.aquaverify.dto.request.ComplaintAssignRequest;
import lk.aquaverify.dto.request.ComplaintCreateRequest;
import lk.aquaverify.dto.request.ComplaintStatusUpdateRequest;
import lk.aquaverify.dto.request.ComplaintUpdateRequest;
import lk.aquaverify.dto.response.ComplaintDetailResponse;
import lk.aquaverify.dto.response.ComplaintResponse;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.entity.*;
import lk.aquaverify.exception.BadRequestException;
import lk.aquaverify.exception.ForbiddenException;
import lk.aquaverify.exception.ResourceNotFoundException;
import lk.aquaverify.repository.AuditLogRepository;
import lk.aquaverify.repository.ComplaintRepository;
import lk.aquaverify.repository.ComplaintUpdateRepository;
import lk.aquaverify.repository.UserRepository;
import lk.aquaverify.repository.WaterSourceRepository;
import lk.aquaverify.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final UserRepository userRepository;
    private final WaterSourceRepository waterSourceRepository;
    private final AuditLogRepository auditLogRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintUpdateRepository complaintUpdateRepository,
                            UserRepository userRepository,
                            WaterSourceRepository waterSourceRepository,
                            AuditLogRepository auditLogRepository) {
        this.complaintRepository = complaintRepository;
        this.complaintUpdateRepository = complaintUpdateRepository;
        this.userRepository = userRepository;
        this.waterSourceRepository = waterSourceRepository;
        this.auditLogRepository = auditLogRepository;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database"));
        }
        throw new ForbiddenException("Authentication required to perform this action");
    }

    private String generateComplaintReference() {
        int currentYear = Year.now().getValue();
        int randomNum = 10000 + new Random().nextInt(90000);
        String ref = "AQV-" + currentYear + "-" + randomNum;
        while (complaintRepository.findByComplaintReferenceAndDeletedAtIsNull(ref).isPresent()) {
            randomNum = 10000 + new Random().nextInt(90000);
            ref = "AQV-" + currentYear + "-" + randomNum;
        }
        return ref;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintCreateRequest request) {
        User citizen = getAuthenticatedUser();

        WaterSource source = null;
        if (request.getWaterSourceId() != null) {
            source = waterSourceRepository.findById(request.getWaterSourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("WaterSource", "id", request.getWaterSourceId()));
        }

        String reference = generateComplaintReference();

        Complaint complaint = new Complaint(
                reference,
                citizen,
                source,
                request.getTitle().trim(),
                request.getDescription().trim(),
                request.getComplaintCategory()
        );

        Complaint saved = complaintRepository.save(complaint);

        // Record initial timeline update
        ComplaintUpdate initialUpdate = new ComplaintUpdate(
                saved,
                citizen,
                "NONE",
                "PENDING",
                "Complaint lodged by citizen with reference " + reference
        );
        complaintUpdateRepository.save(initialUpdate);

        // Record audit log
        auditLogRepository.save(new AuditLog(
                citizen,
                "CREATE_COMPLAINT",
                "COMPLAINT",
                saved.getId().toString(),
                "Citizen lodged complaint " + reference + " (" + saved.getComplaintCategory() + ")"
        ));

        return ComplaintResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getComplaints(Long citizenIdFilter,
                                                          Long officerIdFilter,
                                                          ComplaintStatus status,
                                                          ComplaintCategory category,
                                                          String district,
                                                          String search,
                                                          int page,
                                                          int size,
                                                          String sortBy,
                                                          String sortDir) {
        User currentUser = getAuthenticatedUser();

        // Enforce ownership checks: CITIZEN can only query their own complaints
        Long effectiveCitizenId = citizenIdFilter;
        Long effectiveOfficerId = officerIdFilter;

        if (currentUser.getRole() == Role.CITIZEN) {
            effectiveCitizenId = currentUser.getId();
        } else if (currentUser.getRole() == Role.OFFICER) {
            // If officer didn't specify a citizen, and officerIdFilter is null, they can view assigned or unassigned cases
            if (officerIdFilter != null && !officerIdFilter.equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
                effectiveOfficerId = currentUser.getId();
            }
        }

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.trim().toLowerCase() + "%" : null;

        Page<Complaint> complaintsPage = complaintRepository.filterComplaints(
                effectiveCitizenId,
                effectiveOfficerId,
                status,
                category,
                district,
                searchPattern,
                pageable
        );

        List<ComplaintResponse> content = complaintsPage.getContent().stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                complaintsPage.getNumber(),
                complaintsPage.getSize(),
                complaintsPage.getTotalElements(),
                complaintsPage.getTotalPages(),
                complaintsPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ComplaintDetailResponse getComplaintById(Long id) {
        User currentUser = getAuthenticatedUser();
        Complaint complaint = complaintRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Enforce ownership: CITIZEN can only view their own complaint
        if (currentUser.getRole() == Role.CITIZEN && !complaint.getCitizen().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view this complaint.");
        }

        List<ComplaintUpdate> updates = complaintUpdateRepository.findByComplaintIdOrderByCreatedAtAsc(id);
        return ComplaintDetailResponse.of(complaint, updates);
    }

    @Transactional
    public ComplaintResponse updateComplaint(Long id, ComplaintUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        Complaint complaint = complaintRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Business rule: Citizens can only edit their own complaints if still in PENDING status
        if (currentUser.getRole() == Role.CITIZEN) {
            if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You are not authorized to modify another citizen's complaint.");
            }
            if (complaint.getStatus() != ComplaintStatus.PENDING) {
                throw new BadRequestException("Complaints currently under investigation cannot be directly edited by the citizen.");
            }
        }

        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setComplaintCategory(request.getComplaintCategory());

        if (request.getWaterSourceId() != null) {
            WaterSource source = waterSourceRepository.findById(request.getWaterSourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("WaterSource", "id", request.getWaterSourceId()));
            complaint.setWaterSource(source);
        }

        Complaint saved = complaintRepository.save(complaint);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "UPDATE_COMPLAINT_DETAILS",
                "COMPLAINT",
                saved.getId().toString(),
                "Complaint details updated by " + currentUser.getFullName()
        ));

        return ComplaintResponse.fromEntity(saved);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, ComplaintStatusUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.OFFICER && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only water quality officers and administrators may update complaint status.");
        }

        Complaint complaint = complaintRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        String previousStatus = complaint.getStatus().name();
        complaint.setStatus(request.getStatus());

        // Automatically assign officer if unassigned
        if (complaint.getAssignedOfficer() == null && currentUser.getRole() == Role.OFFICER) {
            complaint.setAssignedOfficer(currentUser);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Record status update in timeline
        ComplaintUpdate update = new ComplaintUpdate(
                saved,
                currentUser,
                previousStatus,
                request.getStatus().name(),
                request.getNote().trim()
        );
        complaintUpdateRepository.save(update);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "UPDATE_COMPLAINT_STATUS",
                "COMPLAINT",
                saved.getId().toString(),
                "Status shifted from " + previousStatus + " to " + request.getStatus().name() + " by " + currentUser.getFullName()
        ));

        return ComplaintResponse.fromEntity(saved);
    }

    @Transactional
    public ComplaintResponse assignOfficer(Long id, ComplaintAssignRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.OFFICER) {
            throw new ForbiddenException("Only administrators and senior officers can assign complaints.");
        }

        Complaint complaint = complaintRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getOfficerId()));

        if (officer.getRole() != Role.OFFICER && officer.getRole() != Role.ADMIN) {
            throw new BadRequestException("Complaints can only be assigned to officers or administrators.");
        }

        complaint.setAssignedOfficer(officer);
        if (complaint.getStatus() == ComplaintStatus.PENDING) {
            complaint.setStatus(ComplaintStatus.UNDER_INVESTIGATION);
        }

        Complaint saved = complaintRepository.save(complaint);

        String note = (request.getNote() != null && !request.getNote().isBlank()) ?
                request.getNote().trim() : "Case assigned to officer " + officer.getFullName();

        ComplaintUpdate update = new ComplaintUpdate(
                saved,
                currentUser,
                "ASSIGNMENT",
                saved.getStatus().name(),
                note
        );
        complaintUpdateRepository.save(update);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "ASSIGN_COMPLAINT",
                "COMPLAINT",
                saved.getId().toString(),
                "Assigned to officer " + officer.getFullName()
        ));

        return ComplaintResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteComplaint(Long id) {
        User currentUser = getAuthenticatedUser();
        Complaint complaint = complaintRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Enforce deletion permission
        if (currentUser.getRole() == Role.CITIZEN) {
            if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You cannot delete another citizen's complaint.");
            }
            if (complaint.getStatus() != ComplaintStatus.PENDING) {
                throw new BadRequestException("Complaints that have proceeded beyond PENDING status cannot be deleted.");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Officers cannot delete complaint records. Please contact an Administrator.");
        }

        // Soft deletion
        complaint.setDeletedAt(Instant.now());
        complaintRepository.save(complaint);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "DELETE_COMPLAINT",
                "COMPLAINT",
                complaint.getId().toString(),
                "Complaint " + complaint.getComplaintReference() + " soft-deleted by " + currentUser.getFullName()
        ));
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getPublicRecentComplaints() {
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        return complaintRepository.filterComplaints(null, null, null, null, null, null, pageable)
                .getContent().stream()
                .map(c -> {
                    // Anonymize citizen identity for public transparency listing
                    ComplaintResponse res = ComplaintResponse.fromEntity(c);
                    res.setCitizenName("Verified Resident (" + c.getCitizen().getDistrict() + ")");
                    return res;
                })
                .collect(Collectors.toList());
    }
}
