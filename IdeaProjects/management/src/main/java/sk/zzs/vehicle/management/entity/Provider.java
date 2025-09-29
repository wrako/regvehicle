package sk.zzs.vehicle.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String providerId; // ID poskytovateľa ZZS
    private String name;
    private String address;

//    @OneToMany(mappedBy = "provider")
//    private List<Vehicle> vehicles;
}
