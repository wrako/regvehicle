package sk.zzs.vehicle.management.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sk.zzs.vehicle.management.dto.ImportResultSummary;
import sk.zzs.vehicle.management.service.DataImportService;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class DataImportController {

    private final DataImportService dataImportService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImportResultSummary> importCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            System.out.println("!!!!!!!!!!! File is Empty !!!!!!!!!!!!");
            return ResponseEntity.badRequest()
                    .body(ImportResultSummary.error("Uploaded file is empty"));
        }

        if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            System.out.println("!!!!!!!!!!! File not a CSV !!!!!!!!!!!!");

            return ResponseEntity.badRequest()
                    .body(ImportResultSummary.error("Only .csv files are supported"));
        }
        System.out.println("!!!!!!!!!!! Success passed controller !!!!!!!!!!!!");

        ImportResultSummary result = dataImportService.importAllEntities(file);
        return ResponseEntity.ok(result);
    }
}
