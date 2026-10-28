package lk.aquaverify.controller;

import jakarta.validation.Valid;
import lk.aquaverify.dto.request.WaterSourceCreateRequest;
import lk.aquaverify.dto.request.WaterSourceUpdateRequest;
import lk.aquaverify.dto.response.ApiResponse;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.dto.response.WaterSourceResponse;
import lk.aquaverify.entity.WaterSourceType;
import lk.aquaverify.service.WaterSourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water-sources")
public class WaterSourceController {

    private final WaterSourceService waterSourceService;

    public WaterSourceController(WaterSourceService waterSourceService) {
        this.waterSourceService = waterSourceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    public ResponseEntity<ApiResponse<WaterSourceResponse>> createSource(@Valid @RequestBody WaterSourceCreateRequest request) {
        WaterSourceResponse response = waterSourceService.createSource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Water source registered successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WaterSourceResponse>>> getSources(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) WaterSourceType sourceType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sourceName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PagedResponse<WaterSourceResponse> response = waterSourceService.getSources(
                district, sourceType, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success("Water sources retrieved successfully", response));
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<String>>> getDistricts() {
        List<String> districts = waterSourceService.getDistricts();
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved", districts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WaterSourceResponse>> getSourceById(@PathVariable Long id) {
        WaterSourceResponse response = waterSourceService.getSourceById(id);
        return ResponseEntity.ok(ApiResponse.success("Water source details retrieved", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    public ResponseEntity<ApiResponse<WaterSourceResponse>> updateSource(
            @PathVariable Long id,
            @Valid @RequestBody WaterSourceUpdateRequest request) {
        WaterSourceResponse response = waterSourceService.updateSource(id, request);
        return ResponseEntity.ok(ApiResponse.success("Water source updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteSource(@PathVariable Long id) {
        waterSourceService.deleteSource(id);
        return ResponseEntity.ok(ApiResponse.success("Water source deleted successfully."));
    }
}
