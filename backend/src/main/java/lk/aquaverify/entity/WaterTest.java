package lk.aquaverify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "water_tests")
public class WaterTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "water_source_id", nullable = false)
    private WaterSource waterSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratory_technician_id", nullable = false)
    private User laboratoryTechnician;

    @Column(name = "sample_date", nullable = false)
    private LocalDate sampleDate;

    @Column(name = "ph_value", nullable = false, precision = 4, scale = 2)
    private BigDecimal phValue;

    @Column(name = "turbidity_ntu", nullable = false, precision = 6, scale = 2)
    private BigDecimal turbidityNtu;

    @Column(name = "tds_ppm", precision = 7, scale = 2)
    private BigDecimal tdsPpm;

    @Column(name = "conductivity_us_cm", precision = 7, scale = 2)
    private BigDecimal conductivityUsCm;

    @Column(name = "nitrate_mg_l", precision = 6, scale = 2)
    private BigDecimal nitrateMgL;

    @Column(name = "e_coli_presence")
    private Boolean eColiPresence = false;

    @Column(name = "laboratory_reference", nullable = false, length = 100)
    private String laboratoryReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public WaterTest() {
    }

    public WaterTest(WaterSource waterSource, User laboratoryTechnician, LocalDate sampleDate, BigDecimal phValue, BigDecimal turbidityNtu, String laboratoryReference) {
        this.waterSource = waterSource;
        this.laboratoryTechnician = laboratoryTechnician;
        this.sampleDate = sampleDate;
        this.phValue = phValue;
        this.turbidityNtu = turbidityNtu;
        this.laboratoryReference = laboratoryReference;
        this.verificationStatus = VerificationStatus.DRAFT;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WaterSource getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(WaterSource waterSource) {
        this.waterSource = waterSource;
    }

    public User getLaboratoryTechnician() {
        return laboratoryTechnician;
    }

    public void setLaboratoryTechnician(User laboratoryTechnician) {
        this.laboratoryTechnician = laboratoryTechnician;
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

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
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
}
