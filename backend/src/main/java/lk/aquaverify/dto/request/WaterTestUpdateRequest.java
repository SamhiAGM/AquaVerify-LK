package lk.aquaverify.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class WaterTestUpdateRequest {

    @NotNull(message = "Sample date is required")
    @PastOrPresent(message = "Sample date cannot be in the future")
    private LocalDate sampleDate;

    @NotNull(message = "pH value is required")
    @DecimalMin(value = "0.00", message = "pH value must be at least 0.00")
    @DecimalMax(value = "14.00", message = "pH value cannot exceed 14.00")
    private BigDecimal phValue;

    @NotNull(message = "Turbidity (NTU) measurement is required")
    @DecimalMin(value = "0.00", message = "Turbidity must be greater than or equal to 0.00 NTU")
    private BigDecimal turbidityNtu;

    @DecimalMin(value = "0.00", message = "TDS must be non-negative")
    private BigDecimal tdsPpm;

    @DecimalMin(value = "0.00", message = "Conductivity must be non-negative")
    private BigDecimal conductivityUsCm;

    @DecimalMin(value = "0.00", message = "Nitrate concentration must be non-negative")
    private BigDecimal nitrateMgL;

    private Boolean eColiPresence = false;

    @NotBlank(message = "Laboratory test reference is required")
    private String laboratoryReference;

    private boolean submitForVerification = false;

    public WaterTestUpdateRequest() {
    }

    public LocalDate getSampleDate() {
        return sampleDate;
    }

    public void setSampleDate(LocalDate sampleDate) {
        this.sampleDate = sampleDate;
    }

    public BigDecimal getPhValue() {
        return phValue;
    }

    public void setPhValue(BigDecimal phValue) {
        this.phValue = phValue;
    }

    public BigDecimal getTurbidityNtu() {
        return turbidityNtu;
    }

    public void setTurbidityNtu(BigDecimal turbidityNtu) {
        this.turbidityNtu = turbidityNtu;
    }

    public BigDecimal getTdsPpm() {
        return tdsPpm;
    }

    public void setTdsPpm(BigDecimal tdsPpm) {
        this.tdsPpm = tdsPpm;
    }

    public BigDecimal getConductivityUsCm() {
        return conductivityUsCm;
    }

    public void setConductivityUsCm(BigDecimal conductivityUsCm) {
        this.conductivityUsCm = conductivityUsCm;
    }

    public BigDecimal getNitrateMgL() {
        return nitrateMgL;
    }

    public void setNitrateMgL(BigDecimal nitrateMgL) {
        this.nitrateMgL = nitrateMgL;
    }

    public Boolean geteColiPresence() {
        return eColiPresence;
    }

    public void seteColiPresence(Boolean eColiPresence) {
        this.eColiPresence = eColiPresence;
    }

    public String getLaboratoryReference() {
        return laboratoryReference;
    }

    public void setLaboratoryReference(String laboratoryReference) {
        this.laboratoryReference = laboratoryReference;
    }

    public boolean isSubmitForVerification() {
        return submitForVerification;
    }

    public void setSubmitForVerification(boolean submitForVerification) {
        this.submitForVerification = submitForVerification;
    }
}
