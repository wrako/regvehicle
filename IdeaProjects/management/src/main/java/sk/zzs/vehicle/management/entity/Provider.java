package sk.zzs.vehicle.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.Where;
import sk.zzs.vehicle.management.listener.ProviderListener;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EntityListeners(ProviderListener.class)
@Where(clause = "archived = false")
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true, nullable = false)
    private String name;
    public String email;
    @Column(nullable = false)
    private String password = "default123";



    private String providerId; // ID poskytovateľa ZZS
    private String address;


    // Relations
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vehicle> vehicles = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NetworkPoint> networkPoints = new ArrayList<>();

    @Column(length = 20)
    private String state = "DISABLED";

    @Column(nullable = false)
    private boolean archived = false;
}
