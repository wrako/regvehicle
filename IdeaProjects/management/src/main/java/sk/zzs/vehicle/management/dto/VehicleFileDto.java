package sk.zzs.vehicle.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleFileDto {
    private String fileName;
    private long size;
    private String downloadUrl;
}
