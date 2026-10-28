package lk.aquaverify.dto.response;

import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {

    private long registeredUsers;
    private long activeComplaints;
    private long resolvedComplaints;
    private long waterSources;
    private long recordedTests;
    private Map<String, Long> usersByRole;
    private Map<String, Long> complaintsByStatus;
    private Map<String, Long> complaintsByCategory;
    private Map<String, Long> sourcesByDistrict;
    private List<AuditLogResponse> recentActivity;

    public AdminDashboardResponse() {
    }

    public static class AuditLogResponse {
        private Long id;
        private String actorName;
        private String actorEmail;
        private String action;
        private String entityType;
        private String entityId;
        private String details;
        private String createdAt;

        public AuditLogResponse() {
        }

        public AuditLogResponse(Long id, String actorName, String actorEmail, String action, String entityType, String entityId, String details, String createdAt) {
            this.id = id;
            this.actorName = actorName;
            this.actorEmail = actorEmail;
            this.action = action;
            this.entityType = entityType;
            this.entityId = entityId;
            this.details = details;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getActorName() {
            return actorName;
        }

        public void setActorName(String actorName) {
            this.actorName = actorName;
        }

        public String getActorEmail() {
            return actorEmail;
        }

        public void setActorEmail(String actorEmail) {
            this.actorEmail = actorEmail;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getEntityType() {
            return entityType;
        }

        public void setEntityType(String entityType) {
            this.entityType = entityType;
        }

        public String getEntityId() {
            return entityId;
        }

        public void setEntityId(String entityId) {
            this.entityId = entityId;
        }

        public String getDetails() {
            return details;
        }

        public void setDetails(String details) {
            this.details = details;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }
    }

    public long getRegisteredUsers() {
        return registeredUsers;
    }

    public void setRegisteredUsers(long registeredUsers) {
        this.registeredUsers = registeredUsers;
    }

    public long getActiveComplaints() {
        return activeComplaints;
    }

    public void setActiveComplaints(long activeComplaints) {
        this.activeComplaints = activeComplaints;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public long getWaterSources() {
        return waterSources;
    }

    public void setWaterSources(long waterSources) {
        this.waterSources = waterSources;
    }

    public long getRecordedTests() {
        return recordedTests;
    }

    public void setRecordedTests(long recordedTests) {
        this.recordedTests = recordedTests;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public Map<String, Long> getComplaintsByStatus() {
        return complaintsByStatus;
    }

    public void setComplaintsByStatus(Map<String, Long> complaintsByStatus) {
        this.complaintsByStatus = complaintsByStatus;
    }

    public Map<String, Long> getComplaintsByCategory() {
        return complaintsByCategory;
    }

    public void setComplaintsByCategory(Map<String, Long> complaintsByCategory) {
        this.complaintsByCategory = complaintsByCategory;
    }

    public Map<String, Long> getSourcesByDistrict() {
        return sourcesByDistrict;
    }

    public void setSourcesByDistrict(Map<String, Long> sourcesByDistrict) {
        this.sourcesByDistrict = sourcesByDistrict;
    }

    public List<AuditLogResponse> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<AuditLogResponse> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
