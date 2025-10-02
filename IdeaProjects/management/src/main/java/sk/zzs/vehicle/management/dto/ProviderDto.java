package sk.zzs.vehicle.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProviderDto {
    private Long id;
    private String providerId;
    private String name;
    private String email;
    private String address;
}
