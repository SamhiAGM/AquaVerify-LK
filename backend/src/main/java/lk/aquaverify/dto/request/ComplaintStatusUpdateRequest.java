package lk.aquaverify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lk.aquaverify.entity.ComplaintStatus;

public class ComplaintStatusUpdateRequest {

    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    @NotBlank(message = "Investigation review note is required")
    private String note;

    public ComplaintStatusUpdateRequest() {
    }

    public ComplaintStatusUpdateRequest(ComplaintStatus status, String note) {
        this.status = status;
        this.note = note;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
