package lk.aquaverify.service;

import lk.aquaverify.dto.request.UserCreateRequest;
import lk.aquaverify.dto.request.UserUpdateRequest;
import lk.aquaverify.dto.response.PagedResponse;
import lk.aquaverify.dto.response.UserResponse;
import lk.aquaverify.entity.AuditLog;
import lk.aquaverify.entity.Role;
import lk.aquaverify.entity.User;
import lk.aquaverify.exception.BadRequestException;
import lk.aquaverify.exception.ForbiddenException;
import lk.aquaverify.exception.ResourceNotFoundException;
import lk.aquaverify.repository.AuditLogRepository;
import lk.aquaverify.repository.UserRepository;
import lk.aquaverify.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
    public PagedResponse<UserResponse> getUsers(Role role, String search, int page, int size, String sortBy, String sortDir) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can view staff directories.");
        }

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.trim().toLowerCase() + "%" : null;

        Page<User> usersPage = userRepository.searchUsers(
                role,
                searchPattern,
                pageable
        );

        List<UserResponse> content = usersPage.getContent().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(id)) {
            throw new ForbiddenException("Access denied to requested account profile.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can provision officer and laboratory accounts.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists: " + email);
        }

        User user = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getPhone().trim(),
                request.getDistrict().trim(),
                request.getRole()
        );

        User saved = userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "CREATE_STAFF_USER",
                "USER",
                saved.getId().toString(),
                "Admin provisioned new " + saved.getRole().name() + " account for " + saved.getFullName()
        ));

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(id)) {
            throw new ForbiddenException("You cannot modify another user's account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone().trim());
        user.setDistrict(request.getDistrict().trim());

        if (currentUser.getRole() == Role.ADMIN && request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        User saved = userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "UPDATE_USER_PROFILE",
                "USER",
                saved.getId().toString(),
                "Profile updated for " + saved.getFullName()
        ));

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can toggle user active status.");
        }

        if (currentUser.getId().equals(id)) {
            throw new BadRequestException("You cannot deactivate your own administrative account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setEnabled(!user.isEnabled());
        User saved = userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "TOGGLE_USER_STATUS",
                "USER",
                saved.getId().toString(),
                "Account status set to enabled=" + saved.isEnabled() + " for " + saved.getFullName()
        ));

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can remove accounts.");
        }

        if (currentUser.getId().equals(id)) {
            throw new BadRequestException("You cannot delete your own administrative account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userRepository.delete(user);

        auditLogRepository.save(new AuditLog(
                currentUser,
                "DELETE_USER",
                "USER",
                id.toString(),
                "Admin removed account: " + user.getEmail()
        ));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getOfficers() {
        return userRepository.findByRole(Role.OFFICER).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
