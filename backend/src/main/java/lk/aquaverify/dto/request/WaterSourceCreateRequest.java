package lk.aquaverify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.aquaverify.entity.WaterSourceType;

public class WaterSourceCreateRequest {

    @NotBlank(message = "Source name is required")
    @Size(min = 3, max = 150, message = "Source name must be between 3 and 150 characters")
    private String sourceName;

    @NotNull(message = "Source type is required")
    private WaterSourceType sourceType;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Location description is required")
    private String locationDescription;

    private Double latitude;
    private Double longitude;

    public WaterSourceCreateRequest() {
    }

    public WaterSourceCreateRequest(String sourceName, WaterSourceType sourceType, String district, String locationDescription, Double latitude, Double longitude) {
        this.sourceName = sourceName;
        this.sourceType = sourceType;
        this.district = district;
        this.locationDescription = locationDescription;
        this.latitude = latitude;
        this.longitude = longitude;
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
}
