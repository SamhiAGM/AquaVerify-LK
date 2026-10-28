package lk.aquaverify.controller;

import jakarta.validation.Valid;
import lk.aquaverify.dto.request.ComplaintAssignRequest;
import lk.aquaverify.dto.request.ComplaintCreateRequest;
import lk.aquaverify.dto.request.ComplaintStatusUpdateRequest;
import lk.aquaverify.dto.request.ComplaintUpdateRequest;
import lk.aquaverify.dto.response.ApiResponse;
import lk.aquaverify.dto.response.ComplaintDetailResponse;
import lk.aquaverify.dto.response.ComplaintResponse;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.entity.ComplaintCategory;
import lk.aquaverify.entity.ComplaintStatus;
import lk.aquaverify.service.ComplaintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(@Valid @RequestBody ComplaintCreateRequest request) {
        ComplaintResponse response = complaintService.createComplaint(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted successfully. Reference: " + response.getComplaintReference(), response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> getComplaints(
            @RequestParam(required = false) Long citizenId,
            @RequestParam(required = false) Long officerId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<ComplaintResponse> response = complaintService.getComplaints(
                citizenId, officerId, status, category, district, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success("Complaints retrieved successfully", response));
    }

    @GetMapping("/public-recent")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getPublicRecentComplaints() {
        List<ComplaintResponse> complaints = complaintService.getPublicRecentComplaints();
        return ResponseEntity.ok(ApiResponse.success("Public recent complaints", complaints));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintDetailResponse response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint details fetched", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintUpdateRequest request) {
        ComplaintResponse response = complaintService.updateComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdateRequest request) {
        ComplaintResponse response = complaintService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated to " + response.getStatus(), response));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignOfficer(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintAssignRequest request) {
        ComplaintResponse response = complaintService.assignOfficer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint has been deleted successfully."));
    }
}
