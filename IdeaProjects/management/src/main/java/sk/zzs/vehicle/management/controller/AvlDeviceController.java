package sk.zzs.vehicle.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.AvlDevice;
import sk.zzs.vehicle.management.service.AvlDeviceService;

import java.util.List;

@RestController
@RequestMapping("/avl-devices")
@CrossOrigin(origins = "*")
public class AvlDeviceController {
    private final AvlDeviceService service;
    public AvlDeviceController(AvlDeviceService service) { this.service = service; }

    @PostMapping
//    @ResponseStatus(HttpStatus.CREATED)
    public AvlDevice add(@RequestBody AvlDevice body) { return service.add(body); }

    @PutMapping("/{id}")
    public AvlDevice edit(@PathVariable Long id, @RequestBody AvlDevice body) { return service.edit(id, body); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping
    public List<AvlDevice> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public AvlDevice getAvl(@PathVariable Long id) { return service.findById(id); }

}
