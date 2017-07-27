package org.diamond.controller;

import org.hibernate.Hibernate;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import persistence.srcimages.SourceImageCollectionRepository;
import persistence.srcimages.SourceImageRepository;
import persistence.srcimages.entities.SourceImage;
import persistence.srcimages.entities.SourceImageCollection;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Blob;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@Controller
public class MycuneiController {
	@Autowired
	private SourceImageCollectionRepository sourceImageCollectionRepository;

	@Autowired
	private SourceImageRepository sourceImageRepository;

	@GetMapping("/")
	public String root(ModelMap model) {
		return "index.html";
	}

	@PostMapping("/handleFile")
	public String handleFileUpload(@RequestParam("file") CommonsMultipartFile file, RedirectAttributes redirectAttributes) {
		processImageCollection(file);
		return "redirect:/";
	}

	@Transactional
	public void processImageCollection(CommonsMultipartFile file) {
		File tmp = null;
		try {
			tmp = new File(System.getProperty("java.io.tmpdir")
					+ File.separator
					+ "file" + System.currentTimeMillis() + ".tmp");
			file.transferTo(tmp);
			ZipFile zipFile = new ZipFile(tmp);
			SourceImageCollection sourceImageCollection = new SourceImageCollection(file.getFileItem().getName());
			/*for (Enumeration<? extends ZipEntry> entries = zipFile.entries(); entries.hasMoreElements();) {
				ZipEntry ze = entries.nextElement();
				SourceImage sourceImage = new SourceImage(sourceImageCollection, ze.getName(), "image/jpeg");
				sourceImage = sourceImageRepository.save(sourceImage);
				InputStream is = null;
				try {
					is = zipFile.getInputStream(ze);
					Blob blob = Hibernate.getLobCreator(sessionFactory.getCurrentSession()).createBlob(is, ze.getSize());
					sourceImageRepository.saveAndFlush(sourceImage);
				} finally {
					if (is != null) { try { is.close(); } catch (Exception e) {} }
				}
			} */
			zipFile.close();
			sourceImageCollectionRepository.save(sourceImageCollection);
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			if (tmp != null) { try { tmp.delete(); } catch (Exception e) { } }
		}
	}
}