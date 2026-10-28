package lk.aquaverify.dto.response;

import lk.aquaverify.entity.Complaint;
import lk.aquaverify.entity.ComplaintCategory;
import lk.aquaverify.entity.ComplaintStatus;

import java.time.Instant;

public class ComplaintResponse {

    private Long id;
    private String complaintReference;
    private Long citizenId;
    private String citizenName;
    private String citizenDistrict;
    private Long waterSourceId;
    private String waterSourceName;
    private Long assignedOfficerId;
    private String assignedOfficerName;
    private String title;
    private String description;
    private ComplaintCategory complaintCategory;
    private ComplaintStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    public ComplaintResponse() {
    }

    public static ComplaintResponse fromEntity(Complaint complaint) {
        if (complaint == null) return null;
        ComplaintResponse dto = new ComplaintResponse();
        dto.setId(complaint.getId());
        dto.setComplaintReference(complaint.getComplaintReference());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setComplaintCategory(complaint.getComplaintCategory());
        dto.setStatus(complaint.getStatus());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        dto.setResolvedAt(complaint.getResolvedAt());

        if (complaint.getCitizen() != null) {
            dto.setCitizenId(complaint.getCitizen().getId());
            dto.setCitizenName(complaint.getCitizen().getFullName());
            dto.setCitizenDistrict(complaint.getCitizen().getDistrict());
        }

        if (complaint.getWaterSource() != null) {
            dto.setWaterSourceId(complaint.getWaterSource().getId());
            dto.setWaterSourceName(complaint.getWaterSource().getSourceName());
        }

        if (complaint.getAssignedOfficer() != null) {
            dto.setAssignedOfficerId(complaint.getAssignedOfficer().getId());
            dto.setAssignedOfficerName(complaint.getAssignedOfficer().getFullName());
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComplaintReference() {
        return complaintReference;
    }

    public void setComplaintReference(String complaintReference) {
        this.complaintReference = complaintReference;
    }

    public Long getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(Long citizenId) {
        this.citizenId = citizenId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public void setCitizenName(String citizenName) {
        this.citizenName = citizenName;
    }

    public String getCitizenDistrict() {
        return citizenDistrict;
    }

    public void setCitizenDistrict(String citizenDistrict) {
        this.citizenDistrict = citizenDistrict;
    }

    public Long getWaterSourceId() {
        return waterSourceId;
    }

    public void setWaterSourceId(Long waterSourceId) {
        this.waterSourceId = waterSourceId;
    }

    public String getWaterSourceName() {
        return waterSourceName;
    }

    public void setWaterSourceName(String waterSourceName) {
        this.waterSourceName = waterSourceName;
    }

    public Long getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(Long assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public String getAssignedOfficerName() {
        return assignedOfficerName;
    }

    public void setAssignedOfficerName(String assignedOfficerName) {
        this.assignedOfficerName = assignedOfficerName;
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

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
