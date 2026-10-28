package lk.aquaverify.dto.response;

import java.util.List;

public class CitizenDashboardResponse {

    private long myTotalComplaints;
    private long pendingComplaints;
    private long inProgress;
    private long resolvedComplaints;
    private List<ComplaintResponse> recentComplaints;
    private List<WaterTestResponse> nearbyVerifiedTests;

    public CitizenDashboardResponse() {
    }

    public CitizenDashboardResponse(long myTotalComplaints, long pendingComplaints, long inProgress, long resolvedComplaints, List<ComplaintResponse> recentComplaints, List<WaterTestResponse> nearbyVerifiedTests) {
        this.myTotalComplaints = myTotalComplaints;
        this.pendingComplaints = pendingComplaints;
        this.inProgress = inProgress;
        this.resolvedComplaints = resolvedComplaints;
        this.recentComplaints = recentComplaints;
        this.nearbyVerifiedTests = nearbyVerifiedTests;
    }

    public long getMyTotalComplaints() {
        return myTotalComplaints;
    }

    public void setMyTotalComplaints(long myTotalComplaints) {
        this.myTotalComplaints = myTotalComplaints;
    }

    public long getPendingComplaints() {
        return pendingComplaints;
    }

    public void setPendingComplaints(long pendingComplaints) {
        this.pendingComplaints = pendingComplaints;
    }

    public long getInProgress() {
        return inProgress;
    }

    public void setInProgress(long inProgress) {
        this.inProgress = inProgress;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public List<ComplaintResponse> getRecentComplaints() {
        return recentComplaints;
    }

    public void setRecentComplaints(List<ComplaintResponse> recentComplaints) {
        this.recentComplaints = recentComplaints;
    }

    public List<WaterTestResponse> getNearbyVerifiedTests() {
        return nearbyVerifiedTests;
    }

    public void setNearbyVerifiedTests(List<WaterTestResponse> nearbyVerifiedTests) {
        this.nearbyVerifiedTests = nearbyVerifiedTests;
    }
}
