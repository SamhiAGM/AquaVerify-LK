package lk.aquaverify.dto.response;

import lk.aquaverify.entity.ComplaintUpdate;

import java.time.Instant;

public class ComplaintUpdateResponse {

    private Long id;
    private Long updatedById;
    private String updatedByName;
    private String previousStatus;
    private String newStatus;
    private String note;
    private Instant createdAt;

    public ComplaintUpdateResponse() {
    }

    public static ComplaintUpdateResponse fromEntity(ComplaintUpdate update) {
        if (update == null) return null;
        ComplaintUpdateResponse dto = new ComplaintUpdateResponse();
        dto.setId(update.getId());
        dto.setPreviousStatus(update.getPreviousStatus());
        dto.setNewStatus(update.getNewStatus());
        dto.setNote(update.getNote());
        dto.setCreatedAt(update.getCreatedAt());

        if (update.getUpdatedBy() != null) {
            dto.setUpdatedById(update.getUpdatedBy().getId());
            dto.setUpdatedByName(update.getUpdatedBy().getFullName());
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUpdatedById() {
        return updatedById;
    }

    public void setUpdatedById(Long updatedById) {
        this.updatedById = updatedById;
    }

    public String getUpdatedByName() {
        return updatedByName;
    }

    public void setUpdatedByName(String updatedByName) {
        this.updatedByName = updatedByName;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
