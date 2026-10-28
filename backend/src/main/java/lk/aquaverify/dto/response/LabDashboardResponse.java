package lk.aquaverify.dto.response;

import java.util.List;

public class LabDashboardResponse {

    private long totalSamples;
    private long pendingVerification;
    private long completedVerified;
    private long draftTests;
    private List<WaterTestResponse> recentTests;

    public LabDashboardResponse() {
    }

    public LabDashboardResponse(long totalSamples, long pendingVerification, long completedVerified, long draftTests, List<WaterTestResponse> recentTests) {
        this.totalSamples = totalSamples;
        this.pendingVerification = pendingVerification;
        this.completedVerified = completedVerified;
        this.draftTests = draftTests;
        this.recentTests = recentTests;
    }

    public long getTotalSamples() {
        return totalSamples;
    }

    public void setTotalSamples(long totalSamples) {
        this.totalSamples = totalSamples;
    }

    public long getPendingVerification() {
        return pendingVerification;
    }

    public void setPendingVerification(long pendingVerification) {
        this.pendingVerification = pendingVerification;
    }

    public long getCompletedVerified() {
        return completedVerified;
    }

    public void setCompletedVerified(long completedVerified) {
        this.completedVerified = completedVerified;
    }

    public long getDraftTests() {
        return draftTests;
    }

    public void setDraftTests(long draftTests) {
        this.draftTests = draftTests;
    }

    public List<WaterTestResponse> getRecentTests() {
        return recentTests;
    }

    public void setRecentTests(List<WaterTestResponse> recentTests) {
        this.recentTests = recentTests;
    }
}
