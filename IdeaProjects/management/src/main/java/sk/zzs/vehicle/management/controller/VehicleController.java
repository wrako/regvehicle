package sk.zzs.vehicle.management.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sk.zzs.vehicle.management.dto.VehicleDto;
import sk.zzs.vehicle.management.dto.VehicleFilter;
import sk.zzs.vehicle.management.enumer.VehicleStatus;
import sk.zzs.vehicle.management.service.VehicleService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public Page<VehicleDto> getVehicles(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stkValidFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stkValidTo,
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {

        VehicleFilter filter = new VehicleFilter(q, status, provider, stkValidFrom, stkValidTo);
        return vehicleService.search(filter, pageable);
    }

    @PostMapping
    public VehicleDto registerVehicle(@RequestBody VehicleDto vehicle) {
        return vehicleService.registerVehicle(vehicle);
    }

    @PostMapping("/{id}/edit")
    public VehicleDto editVehicle(@RequestBody VehicleDto vehicle, @PathVariable Long id) {
        return vehicleService.editVehicle(vehicle, id);
    }

    @GetMapping("/{id}")
    public VehicleDto getVehicle(@PathVariable Long id) {
        return vehicleService.getVehicleById(id);
    }

    @PostMapping("/{id}/delete")
    public void delete(@PathVariable Long id) { vehicleService.delete(id); }


    // ======= UPLOAD FILES & ATTACH =======
    @PostMapping(path = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VehicleDto uploadVehicleFiles(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files
    ) throws IOException {
        return vehicleService.uploadFilesAndAttach(id, files);
    }



    @GetMapping("/file")
    public ResponseEntity<Resource> downloadFileByPath(
            @RequestParam("path") String path,
            HttpServletRequest request
    ) throws Exception {
        Path base = Paths.get("C:/uploads/vehicles").toAbsolutePath().normalize();
        Path requested = Paths.get(path).toAbsolutePath().normalize();
        if (!requested.startsWith(base) || Files.isDirectory(requested) || !Files.exists(requested)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(requested.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }


    @PostMapping("/{id}/archive")
    public VehicleDto archive(@PathVariable Long id,
                              @RequestParam(value = "reason", required = false) String reason,
                              @RequestParam(value = "status", required = false) VehicleStatus status) {
//        System.out.println("==================================");
//        System.out.println(status);
//        System.out.println("==================================");

        return vehicleService.archiveVehicle(id, reason, status);
    }

    @PostMapping("/{id}/unarchive")
    public VehicleDto unarchive(@PathVariable Long id,
    @RequestParam(value = "status", required = false) VehicleStatus status) {
        return vehicleService.unarchiveVehicle(id, status);
    }

    @GetMapping("/archived/page")
    public Page<VehicleDto> getArchivedPaged(Pageable pageable) {
        return vehicleService.getArchived(pageable);
    }

    @GetMapping("/archived/{id}")
    public VehicleDto getArchivedVehicle(@PathVariable Long id) {
        return vehicleService.getArchivedById(id);
    }

}
