package lk.aquaverify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 120, message = "Full name must be between 3 and 120 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(?:\\+94|0)?[1-9][0-9]{8}$", message = "Please enter a valid Sri Lankan phone number")
    private String phone;

    @NotBlank(message = "District is required")
    private String district;

    private Boolean enabled;

    public UserUpdateRequest() {
    }

    public UserUpdateRequest(String fullName, String phone, String district, Boolean enabled) {
        this.fullName = fullName;
        this.phone = phone;
        this.district = district;
        this.enabled = enabled;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
