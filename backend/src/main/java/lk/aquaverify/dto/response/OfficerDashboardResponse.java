package lk.aquaverify.dto.response;

import java.util.List;
import java.util.Map;

public class OfficerDashboardResponse {

    private long assignedComplaints;
    private long pendingReviews;
    private long underInvestigation;
    private long resolvedCases;
    private Map<String, Long> complaintsByCategory;
    private List<ComplaintResponse> recentAssigned;

    public OfficerDashboardResponse() {
    }

    public OfficerDashboardResponse(long assignedComplaints, long pendingReviews, long underInvestigation, long resolvedCases, Map<String, Long> complaintsByCategory, List<ComplaintResponse> recentAssigned) {
        this.assignedComplaints = assignedComplaints;
        this.pendingReviews = pendingReviews;
        this.underInvestigation = underInvestigation;
        this.resolvedCases = resolvedCases;
        this.complaintsByCategory = complaintsByCategory;
        this.recentAssigned = recentAssigned;
    }

    public long getAssignedComplaints() {
        return assignedComplaints;
    }

    public void setAssignedComplaints(long assignedComplaints) {
        this.assignedComplaints = assignedComplaints;
    }

    public long getPendingReviews() {
        return pendingReviews;
    }

    public void setPendingReviews(long pendingReviews) {
        this.pendingReviews = pendingReviews;
    }

    public long getUnderInvestigation() {
        return underInvestigation;
    }

    public void setUnderInvestigation(long underInvestigation) {
        this.underInvestigation = underInvestigation;
    }

    public long getResolvedCases() {
        return resolvedCases;
    }

    public void setResolvedCases(long resolvedCases) {
        this.resolvedCases = resolvedCases;
    }

    public Map<String, Long> getComplaintsByCategory() {
        return complaintsByCategory;
    }

    public void setComplaintsByCategory(Map<String, Long> complaintsByCategory) {
        this.complaintsByCategory = complaintsByCategory;
    }

    public List<ComplaintResponse> getRecentAssigned() {
        return recentAssigned;
    }

    public void setRecentAssigned(List<ComplaintResponse> recentAssigned) {
        this.recentAssigned = recentAssigned;
    }
}
