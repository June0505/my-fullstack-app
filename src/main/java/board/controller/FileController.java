package board.controller;

import board.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) {
        return fileService.upload(file);
    }

    @GetMapping(value="{fileName}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE})
    public Resource getImage(@PathVariable String fileName) {
        return fileService.getImage(fileName);
    }
}
