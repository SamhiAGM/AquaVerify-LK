package lk.aquaverify.service;

import lk.aquaverify.dto.request.WaterSourceCreateRequest;
import lk.aquaverify.dto.request.WaterSourceUpdateRequest;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.dto.response.WaterSourceResponse;
import lk.aquaverify.entity.AuditLog;
import lk.aquaverify.entity.Role;
import lk.aquaverify.entity.User;
import lk.aquaverify.entity.WaterSource;
import lk.aquaverify.entity.WaterSourceType;
import lk.aquaverify.exception.ForbiddenException;
import lk.aquaverify.exception.ResourceNotFoundException;
import lk.aquaverify.repository.AuditLogRepository;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaterSourceService {

    private final WaterSourceRepository waterSourceRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public WaterSourceService(WaterSourceRepository waterSourceRepository,
                              UserRepository userRepository,
                              AuditLogRepository auditLogRepository) {
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
    public WaterSourceResponse createSource(WaterSourceCreateRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.OFFICER) {
            throw new ForbiddenException("Only administrators and water quality officers can register water sources.");
        }

        WaterSource source = new WaterSource(
                request.getSourceName().trim(),
                request.getSourceType(),
                request.getDistrict().trim(),
                request.getLocationDescription().trim(),
                request.getLatitude(),
                request.getLongitude()
        );

        WaterSource saved = waterSourceRepository.save(source);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "CREATE_WATER_SOURCE",
                "WATER_SOURCE",
                saved.getId().toString(),
                "Registered new water source: " + saved.getSourceName() + " (" + saved.getDistrict() + ")"
        ));

        return WaterSourceResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<WaterSourceResponse> getSources(String district,
                                                         WaterSourceType sourceType,
                                                         String search,
                                                         int page,
                                                         int size,
                                                         String sortBy,
                                                         String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.trim().toLowerCase() + "%" : null;

        Page<WaterSource> sourcesPage = waterSourceRepository.filterSources(
                district != null && !district.isBlank() ? district.trim() : null,
                sourceType,
                searchPattern,
                pageable
        );

        List<WaterSourceResponse> content = sourcesPage.getContent().stream()
                .map(WaterSourceResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                sourcesPage.getNumber(),
                sourcesPage.getSize(),
                sourcesPage.getTotalElements(),
                sourcesPage.getTotalPages(),
                sourcesPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public WaterSourceResponse getSourceById(Long id) {
        WaterSource source = waterSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterSource", "id", id));
        return WaterSourceResponse.fromEntity(source);
    }

    @Transactional
    public WaterSourceResponse updateSource(Long id, WaterSourceUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.OFFICER) {
            throw new ForbiddenException("Only administrators and officers can update water sources.");
        }

        WaterSource source = waterSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterSource", "id", id));

        source.setSourceName(request.getSourceName().trim());
        source.setSourceType(request.getSourceType());
        source.setDistrict(request.getDistrict().trim());
        source.setLocationDescription(request.getLocationDescription().trim());
        source.setLatitude(request.getLatitude());
        source.setLongitude(request.getLongitude());

        WaterSource updated = waterSourceRepository.save(source);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "UPDATE_WATER_SOURCE",
                "WATER_SOURCE",
                updated.getId().toString(),
                "Updated details for water source: " + updated.getSourceName()
        ));

        return WaterSourceResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSource(Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can remove registered water sources.");
        }

        WaterSource source = waterSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaterSource", "id", id));

        waterSourceRepository.delete(source);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "DELETE_WATER_SOURCE",
                "WATER_SOURCE",
                id.toString(),
                "Deleted water source: " + source.getSourceName()
        ));
    }

    @Transactional(readOnly = true)
    public List<String> getDistricts() {
        return waterSourceRepository.findDistinctDistricts();
    }
}
