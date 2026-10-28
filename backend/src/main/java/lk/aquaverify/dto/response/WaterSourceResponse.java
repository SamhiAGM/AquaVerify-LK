package lk.aquaverify.dto.response;

import lk.aquaverify.entity.WaterSource;
import lk.aquaverify.entity.WaterSourceType;

import java.time.Instant;

public class WaterSourceResponse {

    private Long id;
    private String sourceName;
    private WaterSourceType sourceType;
    private String district;
    private String locationDescription;
    private Double latitude;
    private Double longitude;
    private Instant createdAt;

    public WaterSourceResponse() {
    }

    public WaterSourceResponse(Long id, String sourceName, WaterSourceType sourceType, String district, String locationDescription, Double latitude, Double longitude, Instant createdAt) {
        this.id = id;
        this.sourceName = sourceName;
        this.sourceType = sourceType;
        this.district = district;
        this.locationDescription = locationDescription;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
    }

    public static WaterSourceResponse fromEntity(WaterSource source) {
        if (source == null) return null;
        return new WaterSourceResponse(
                source.getId(),
                source.getSourceName(),
                source.getSourceType(),
                source.getDistrict(),
                source.getLocationDescription(),
                source.getLatitude(),
                source.getLongitude(),
                source.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public WaterSourceType getSourceType() {
        return sourceType;
    }

    public void setSourceType(WaterSourceType sourceType) {
        this.sourceType = sourceType;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getLocationDescription() {
        return locationDescription;
    }

    public void setLocationDescription(String locationDescription) {
        this.locationDescription = locationDescription;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
