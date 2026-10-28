package lk.aquaverify.dto.response;

public class PublicDashboardStatsResponse {

    private long totalComplaints;
    private long resolvedComplaints;
    private long waterTestsRecorded;
    private long monitoredSources;
    private long districtCoverageCount;

    public PublicDashboardStatsResponse() {
    }

    public PublicDashboardStatsResponse(long totalComplaints, long resolvedComplaints, long waterTestsRecorded, long monitoredSources, long districtCoverageCount) {
        this.totalComplaints = totalComplaints;
        this.resolvedComplaints = resolvedComplaints;
        this.waterTestsRecorded = waterTestsRecorded;
        this.monitoredSources = monitoredSources;
        this.districtCoverageCount = districtCoverageCount;
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public long getWaterTestsRecorded() {
        return waterTestsRecorded;
    }

    public void setWaterTestsRecorded(long waterTestsRecorded) {
        this.waterTestsRecorded = waterTestsRecorded;
    }

    public long getMonitoredSources() {
        return monitoredSources;
    }

    public void setMonitoredSources(long monitoredSources) {
        this.monitoredSources = monitoredSources;
    }

    public long getDistrictCoverageCount() {
        return districtCoverageCount;
    }

    public void setDistrictCoverageCount(long districtCoverageCount) {
        this.districtCoverageCount = districtCoverageCount;
    }
}
