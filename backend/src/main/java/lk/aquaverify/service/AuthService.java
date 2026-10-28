package lk.aquaverify.service;

import lk.aquaverify.dto.request.ForgotPasswordRequest;
import lk.aquaverify.dto.request.LoginRequest;
import lk.aquaverify.dto.request.RegisterRequest;
import lk.aquaverify.dto.request.ResetPasswordRequest;
import lk.aquaverify.dto.response.AuthResponse;
import lk.aquaverify.dto.response.UserResponse;
import lk.aquaverify.entity.AuditLog;
import lk.aquaverify.entity.Role;
import lk.aquaverify.entity.User;
import lk.aquaverify.exception.BadRequestException;
import lk.aquaverify.exception.ResourceNotFoundException;
import lk.aquaverify.exception.UnauthorizedException;
import lk.aquaverify.repository.AuditLogRepository;
import lk.aquaverify.repository.UserRepository;
import lk.aquaverify.security.JwtTokenProvider;
import lk.aquaverify.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final Set<String> SRI_LANKA_DISTRICTS = new HashSet<>(Arrays.asList(
            "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
            "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
            "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
            "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
    ));

    // In-memory token store for academic reset token demonstration (token -> ResetTokenEntry)
    private final Map<String, ResetTokenEntry> resetTokenStore = new ConcurrentHashMap<>();

    private record ResetTokenEntry(String email, Instant expiry) {}

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogRepository auditLogRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        auditLogRepository.save(new AuditLog(
                user,
                "USER_LOGIN",
                "USER",
                user.getId().toString(),
                "User successfully logged in with role: " + user.getRole().name()
        ));

        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        // Validate district against official Sri Lanka administrative divisions
        String rawDistrict = request.getDistrict().trim();
        String cleanedDistrict = rawDistrict.replaceAll("(?i)\\s+district$", "").trim();
        String matchedDistrict = SRI_LANKA_DISTRICTS.stream()
                .filter(d -> d.equalsIgnoreCase(cleanedDistrict) || d.equalsIgnoreCase(rawDistrict))
                .findFirst()
                .orElse(null);

        if (matchedDistrict == null) {
            throw new BadRequestException("Invalid Sri Lankan district: " + request.getDistrict() +
                    ". Must be one of the 25 administrative districts.");
        }

        // Check duplicate email
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists. Please log in.");
        }

        // Public registrations MUST strictly receive CITIZEN role
        User user = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getPhone().trim().replaceAll("[\\s\\-()]", ""),
                matchedDistrict,
                Role.CITIZEN
        );

        User savedUser = userRepository.save(user);

        // Generate JWT token for newly registered citizen
        String token = tokenProvider.generateTokenFromUser(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().name()
        );

        auditLogRepository.save(new AuditLog(
                savedUser,
                "USER_REGISTERED",
                "USER",
                savedUser.getId().toString(),
                "New citizen registered from district: " + savedUser.getDistrict()
        ));

        return new AuthResponse(token, UserResponse.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("No authenticated user found in session.");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserResponse.fromEntity(user);
    }

    public Map<String, Object> requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + email));

        String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant expiry = Instant.now().plusSeconds(900); // 15 minutes
        resetTokenStore.put(resetToken, new ResetTokenEntry(email, expiry));

        log.info("PASSWORD RESET REQUEST: email='{}', resetToken='{}'", email, resetToken);

        Map<String, Object> result = new HashMap<>();
        result.put("email", email);
        result.put("resetToken", resetToken);
        result.put("notice", "For this academic demonstration environment, no external SMTP server is configured. " +
                "Your 8-character verification reset token is: " + resetToken + " (valid for 15 minutes).");
        return result;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        String token = request.getToken().trim().toUpperCase();
        ResetTokenEntry entry = resetTokenStore.get(token);
        if (entry == null || entry.expiry().isBefore(Instant.now())) {
            throw new BadRequestException("Invalid or expired password reset token. Please request a new token.");
        }

        User user = userRepository.findByEmail(entry.email())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetTokenStore.remove(token);

        auditLogRepository.save(new AuditLog(
                user,
                "PASSWORD_RESET",
                "USER",
                user.getId().toString(),
                "User password successfully updated via reset token workflow"
        ));
    }
}
