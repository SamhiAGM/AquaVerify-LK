package lk.aquaverify.dto.response;

import lk.aquaverify.entity.VerificationStatus;
import lk.aquaverify.entity.WaterTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class WaterTestResponse {

    private Long id;
    private Long waterSourceId;
    private String waterSourceName;
    private String waterSourceDistrict;
    private String waterSourceType;
    private Long laboratoryTechnicianId;
    private String laboratoryTechnicianName;
    private LocalDate sampleDate;
    private BigDecimal phValue;
    private BigDecimal turbidityNtu;
    private BigDecimal tdsPpm;
    private BigDecimal conductivityUsCm;
    private BigDecimal nitrateMgL;
    private Boolean eColiPresence;
    private String laboratoryReference;
    private VerificationStatus verificationStatus;
    private Long verifiedById;
    private String verifiedByName;
    private Instant verifiedAt;
    private Instant createdAt;
    private Instant updatedAt;

    // SLS 614 standard compliance indicators
    private boolean phCompliant;
    private boolean turbidityCompliant;
    private String standardRemarks;

    public WaterTestResponse() {
    }

    public static WaterTestResponse fromEntity(WaterTest test) {
        if (test == null) return null;
        WaterTestResponse dto = new WaterTestResponse();
        dto.setId(test.getId());
        dto.setSampleDate(test.getSampleDate());
        dto.setPhValue(test.getPhValue());
        dto.setTurbidityNtu(test.getTurbidityNtu());
        dto.setTdsPpm(test.getTdsPpm());
        dto.setConductivityUsCm(test.getConductivityUsCm());
        dto.setNitrateMgL(test.getNitrateMgL());
        dto.seteColiPresence(test.geteColiPresence());
        dto.setLaboratoryReference(test.getLaboratoryReference());
        dto.setVerificationStatus(test.getVerificationStatus());
        dto.setVerifiedAt(test.getVerifiedAt());
        dto.setCreatedAt(test.getCreatedAt());
        dto.setUpdatedAt(test.getUpdatedAt());

        if (test.getWaterSource() != null) {
            dto.setWaterSourceId(test.getWaterSource().getId());
            dto.setWaterSourceName(test.getWaterSource().getSourceName());
            dto.setWaterSourceDistrict(test.getWaterSource().getDistrict());
            dto.setWaterSourceType(test.getWaterSource().getSourceType().name());
        }

        if (test.getLaboratoryTechnician() != null) {
            dto.setLaboratoryTechnicianId(test.getLaboratoryTechnician().getId());
            dto.setLaboratoryTechnicianName(test.getLaboratoryTechnician().getFullName());
        }

        if (test.getVerifiedBy() != null) {
            dto.setVerifiedById(test.getVerifiedBy().getId());
            dto.setVerifiedByName(test.getVerifiedBy().getFullName());
        }

        // SLS 614:2013 Reference Standard Checks
        // pH allowable range: 6.5 to 8.5
        boolean phOk = test.getPhValue() != null &&
                test.getPhValue().compareTo(BigDecimal.valueOf(6.5)) >= 0 &&
                test.getPhValue().compareTo(BigDecimal.valueOf(8.5)) <= 0;
        dto.setPhCompliant(phOk);

        // Turbidity allowable threshold: <= 2.0 NTU (desirable limit)
        boolean turbOk = test.getTurbidityNtu() != null &&
                test.getTurbidityNtu().compareTo(BigDecimal.valueOf(2.0)) <= 0;
        dto.setTurbidityCompliant(turbOk);

        if (phOk && turbOk) {
            dto.setStandardRemarks("Parameters tested meet SLS 614:2013 basic physical benchmarks (pH & Turbidity). Full biological safety requires comprehensive bacteriological clearance.");
        } else if (!phOk && !turbOk) {
            dto.setStandardRemarks("Both pH and Turbidity deviate from recommended SLS 614:2013 parameters. Treatment adjustment recommended.");
        } else if (!phOk) {
            dto.setStandardRemarks("pH reading deviates from the recommended SLS 614:2013 range (6.5 - 8.5).");
        } else {
            dto.setStandardRemarks("Turbidity exceeds the SLS 614:2013 desirable threshold (2.0 NTU). Filtration review recommended.");
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

    public String getWaterSourceDistrict() {
        return waterSourceDistrict;
    }

    public void setWaterSourceDistrict(String waterSourceDistrict) {
        this.waterSourceDistrict = waterSourceDistrict;
    }

    public String getWaterSourceType() {
        return waterSourceType;
    }

    public void setWaterSourceType(String waterSourceType) {
        this.waterSourceType = waterSourceType;
    }

    public Long getLaboratoryTechnicianId() {
        return laboratoryTechnicianId;
    }

    public void setLaboratoryTechnicianId(Long laboratoryTechnicianId) {
        this.laboratoryTechnicianId = laboratoryTechnicianId;
    }

    public String getLaboratoryTechnicianName() {
        return laboratoryTechnicianName;
    }

    public void setLaboratoryTechnicianName(String laboratoryTechnicianName) {
        this.laboratoryTechnicianName = laboratoryTechnicianName;
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

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Long getVerifiedById() {
        return verifiedById;
    }

    public void setVerifiedById(Long verifiedById) {
        this.verifiedById = verifiedById;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
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

    public boolean isPhCompliant() {
        return phCompliant;
    }

    public void setPhCompliant(boolean phCompliant) {
        this.phCompliant = phCompliant;
    }

    public boolean isTurbidityCompliant() {
        return turbidityCompliant;
    }

    public void setTurbidityCompliant(boolean turbidityCompliant) {
        this.turbidityCompliant = turbidityCompliant;
    }

    public String getStandardRemarks() {
        return standardRemarks;
    }

    public void setStandardRemarks(String standardRemarks) {
        this.standardRemarks = standardRemarks;
    }
}
