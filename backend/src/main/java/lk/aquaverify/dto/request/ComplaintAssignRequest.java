package lk.aquaverify.dto.request;

import jakarta.validation.constraints.NotNull;

public class ComplaintAssignRequest {

    @NotNull(message = "Officer ID is required")
    private Long officerId;

    private String note;

    public ComplaintAssignRequest() {
    }

    public ComplaintAssignRequest(Long officerId, String note) {
        this.officerId = officerId;
        this.note = note;
    }

    public Long getOfficerId() {
        return officerId;
    }

    public void setOfficerId(Long officerId) {
        this.officerId = officerId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
