package lk.aquaverify.dto.response;

import lk.aquaverify.entity.Complaint;
import lk.aquaverify.entity.ComplaintUpdate;

import java.util.List;
import java.util.stream.Collectors;

public class ComplaintDetailResponse {

    private ComplaintResponse complaint;
    private WaterSourceResponse waterSource;
    private List<ComplaintUpdateResponse> timeline;

    public ComplaintDetailResponse() {
    }

    public ComplaintDetailResponse(ComplaintResponse complaint, WaterSourceResponse waterSource, List<ComplaintUpdateResponse> timeline) {
        this.complaint = complaint;
        this.waterSource = waterSource;
        this.timeline = timeline;
    }

    public static ComplaintDetailResponse of(Complaint complaint, List<ComplaintUpdate> updates) {
        ComplaintResponse complaintDto = ComplaintResponse.fromEntity(complaint);
        WaterSourceResponse sourceDto = WaterSourceResponse.fromEntity(complaint.getWaterSource());
        List<ComplaintUpdateResponse> timelineDto = updates.stream()
                .map(ComplaintUpdateResponse::fromEntity)
                .collect(Collectors.toList());

        return new ComplaintDetailResponse(complaintDto, sourceDto, timelineDto);
    }

    public ComplaintResponse getComplaint() {
        return complaint;
    }

    public void setComplaint(ComplaintResponse complaint) {
        this.complaint = complaint;
    }

    public WaterSourceResponse getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(WaterSourceResponse waterSource) {
        this.waterSource = waterSource;
    }

    public List<ComplaintUpdateResponse> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<ComplaintUpdateResponse> timeline) {
        this.timeline = timeline;
    }
}
