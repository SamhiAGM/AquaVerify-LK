package lk.aquaverify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.aquaverify.entity.ComplaintCategory;

public class ComplaintUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must provide at least 10 characters")
    private String description;

    @NotNull(message = "Complaint category is required")
    private ComplaintCategory complaintCategory;

    private Long waterSourceId;

    public ComplaintUpdateRequest() {
    }

    public ComplaintUpdateRequest(String title, String description, ComplaintCategory complaintCategory, Long waterSourceId) {
        this.title = title;
        this.description = description;
        this.complaintCategory = complaintCategory;
        this.waterSourceId = waterSourceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintCategory getComplaintCategory() {
        return complaintCategory;
    }

    public void setComplaintCategory(ComplaintCategory complaintCategory) {
        this.complaintCategory = complaintCategory;
    }

    public Long getWaterSourceId() {
        return waterSourceId;
    }

    public void setWaterSourceId(Long waterSourceId) {
        this.waterSourceId = waterSourceId;
    }
}
