package lk.aquaverify.controller;

import jakarta.validation.Valid;
import lk.aquaverify.dto.request.WaterTestCreateRequest;
import lk.aquaverify.dto.request.WaterTestUpdateRequest;
import lk.aquaverify.dto.request.WaterTestVerifyRequest;
import lk.aquaverify.dto.response.ApiResponse;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.dto.response.WaterTestResponse;
import lk.aquaverify.entity.VerificationStatus;
import lk.aquaverify.service.WaterTestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/water-tests")
public class WaterTestController {

    private final WaterTestService waterTestService;

    public WaterTestController(WaterTestService waterTestService) {
        this.waterTestService = waterTestService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<WaterTestResponse>> createTest(@Valid @RequestBody WaterTestCreateRequest request) {
        WaterTestResponse response = waterTestService.createTest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Laboratory test record created successfully", response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<WaterTestResponse>>> getTests(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(required = false) Long sourceId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sampleDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<WaterTestResponse> response = waterTestService.getTests(
                status, sourceId, technicianId, district, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success("Water tests retrieved", response));
    }

    @GetMapping("/verified")
    public ResponseEntity<ApiResponse<PagedResponse<WaterTestResponse>>> getVerifiedTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<WaterTestResponse> response = waterTestService.getVerifiedTests(page, size);
        return ResponseEntity.ok(ApiResponse.success("Verified public water test records", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WaterTestResponse>> getTestById(@PathVariable Long id) {
        WaterTestResponse response = waterTestService.getTestById(id);
        return ResponseEntity.ok(ApiResponse.success("Water test details", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<WaterTestResponse>> updateTest(
            @PathVariable Long id,
            @Valid @RequestBody WaterTestUpdateRequest request) {
        WaterTestResponse response = waterTestService.updateTest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Water test record updated", response));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WaterTestResponse>> verifyTest(
            @PathVariable Long id,
            @Valid @RequestBody WaterTestVerifyRequest request) {
        WaterTestResponse response = waterTestService.verifyTest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test record verification status updated to " + response.getVerificationStatus(), response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteTest(@PathVariable Long id) {
        waterTestService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Water test record deleted successfully."));
    }
}
