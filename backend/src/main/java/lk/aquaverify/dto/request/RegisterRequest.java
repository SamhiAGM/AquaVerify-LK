package lk.aquaverify.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 120, message = "Full name must be between 3 and 120 characters")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Contact phone number is required")
    @Pattern(regexp = "^(?:\\+94|0)?[1-9][0-9]{8}$", message = "Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)")
    private String phone;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    private Boolean termsAccepted = true;

    public RegisterRequest() {
    }

    public RegisterRequest(String fullName, String email, String phone, String district, String password, String confirmPassword, Boolean termsAccepted) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone != null ? phone.replaceAll("[\\s\\-()]", "") : null;
        this.district = district;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.termsAccepted = termsAccepted != null ? termsAccepted : true;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone != null ? phone.replaceAll("[\\s\\-()]", "") : null;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public Boolean getTermsAccepted() {
        return termsAccepted;
    }

    public void setTermsAccepted(Boolean termsAccepted) {
        this.termsAccepted = termsAccepted;
    }
}
