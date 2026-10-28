package lk.aquaverify.dto.request;

import jakarta.validation.constraints.NotNull;
import lk.aquaverify.entity.VerificationStatus;

public class WaterTestVerifyRequest {

    @NotNull(message = "Verification status decision is required (VERIFIED or REJECTED)")
    private VerificationStatus status;

    private String reviewNote;

    public WaterTestVerifyRequest() {
    }

    public WaterTestVerifyRequest(VerificationStatus status, String reviewNote) {
        this.status = status;
        this.reviewNote = reviewNote;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getReviewNote() {
        return reviewNote;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
    }
}
