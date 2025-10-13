package sk.zzs.vehicle.management.dto;// VehicleDto.java
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleDto {
    private Long id;

    private String licensePlate;
    private String vinNum;

    private String brand;
    private String model;

    private LocalDate firstRegistrationDate;
    private LocalDate lastTechnicalCheckDate;
    private LocalDate technicalCheckValidUntil;

    // flat IDs used by your mapper
    private Long providerId;
    private String providerName;

    // Provider assignment dates
    private LocalDate providerAssignmentStartDate;
    private LocalDate providerAssignmentEndDate;

    private List<String> filePaths;

//    private String archivedBy;
//    private String archivedReason;


//    private Long avlDeviceId;
//    private Long rdstDeviceId;


    // --- allow nested { "id": X } from frontend ---

//    @JsonProperty("provider")
//    private void setProviderRef(Map<String, Object> ref) {
//        this.providerId = extractId(ref);
//    }

//    @JsonProperty("avlDevice")
//    private void setAvlDeviceRef(Map<String, Object> ref) {
//        this.avlDeviceId = extractId(ref);
//    }
//
//    @JsonProperty("rdstDevice")
//    private void setRdstDeviceRef(Map<String, Object> ref) {
//        this.rdstDeviceId = extractId(ref);
//    }

//    @JsonProperty("networkPoint")
//    private void setNetworkPointRef(Map<String, Object> ref) {
//        this.networkPointId = extractId(ref);
//    }

    private static Long extractId(Map<String, Object> ref) {
        if (ref == null) return null;
        Object id = ref.get("id");
        if (id == null) return null;
        return (id instanceof Number n) ? n.longValue() : Long.valueOf(id.toString());
    }
}
