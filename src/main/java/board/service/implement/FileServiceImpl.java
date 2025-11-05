package board.service.implement;

import board.service.FileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Value( "${file.path}")
    private String filePath;
    @Value( "${file.url}")
    private String fileUrl;

    @Override
    public String upload(MultipartFile file) {
        if (file.isEmpty())
            return null;

        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String uuid = UUID.randomUUID().toString();
        String saveFileName = uuid + extension;
        String savePath = filePath + saveFileName;

        try {
            File saveDirectory = new File(filePath);
            if (!saveDirectory.exists()) {
                if (!saveDirectory.mkdirs()) {
                    System.err.println("파일 업로드 디렉토리 생성 실패: " + filePath);
                    return null;
                }
            }
        } catch (Exception e) {
            System.err.println("디렉토리 생성 중 예외 발생: " + filePath);
            e.printStackTrace();
            return null;
        }


        try {
            file.transferTo(new File(savePath));
        } catch (IOException e) {
            System.err.println("파일 전송(transferTo) 중 실패: " + savePath);
            e.printStackTrace();
            return null;
        }

        return fileUrl + saveFileName;
    }

    @Override
    public Resource getImage(String fileName) {
        Resource resource = null;

        try {
            resource = new UrlResource("file:" + filePath + fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return resource;
    }

}