package lk.aquaverify.controller;

import lk.aquaverify.dto.response.*;
import lk.aquaverify.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/public-stats")
    public ResponseEntity<ApiResponse<PublicDashboardStatsResponse>> getPublicStats() {
        PublicDashboardStatsResponse response = dashboardService.getPublicStats();
        return ResponseEntity.ok(ApiResponse.success("Platform public statistics", response));
    }

    @GetMapping("/citizen")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<CitizenDashboardResponse>> getCitizenDashboard() {
        CitizenDashboardResponse response = dashboardService.getCitizenDashboard();
        return ResponseEntity.ok(ApiResponse.success("Citizen dashboard data", response));
    }

    @GetMapping("/officer")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<OfficerDashboardResponse>> getOfficerDashboard() {
        OfficerDashboardResponse response = dashboardService.getOfficerDashboard();
        return ResponseEntity.ok(ApiResponse.success("Officer dashboard data", response));
    }

    @GetMapping("/laboratory")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<LabDashboardResponse>> getLabDashboard() {
        LabDashboardResponse response = dashboardService.getLabDashboard();
        return ResponseEntity.ok(ApiResponse.success("Laboratory dashboard data", response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success("Administrative dashboard data", response));
    }
}
