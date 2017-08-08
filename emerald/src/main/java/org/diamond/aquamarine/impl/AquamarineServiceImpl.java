package org.diamond.aquamarine.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContent;
import org.diamond.aquamarine.IContentInfo;
import org.diamond.aquamarine.SubmitOperationResult;
import org.diamond.aquamarineclient.Aquamarine;
import org.diamond.aquamarineclient.Blob;
import org.diamond.aquamarineclient.ContentDesc;
import org.diamond.persistence.srcimages.IStorageNodeRepository;
import org.diamond.persistence.srcimages.entities.StorageNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import java.io.*;
import java.nio.file.Files;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static java.util.stream.Collectors.toSet;

@Service
public class AquamarineServiceImpl implements IAquamarineService {
    @Autowired
    private Aquamarine aquamarine;

    @Autowired
    private IStorageNodeRepository storageNodeRepository;

    private static final Pattern EXT_PATTERN = Pattern.compile("(?<base>.*)(?<ext>\\.(\\w{1,4}))$");

    private static final Pattern CONFLICT_RESOLVER_PATTERN = Pattern.compile("(?<base>.*)\\((?<num>\\d+)\\)$");

    @Override
    public IContent retrieveContent(UUID uuid) throws IOException {
        String mimeType;
        long length;
        InputStreamResource resource;
        Blob blob = null;
        try {
            blob = aquamarine.retrieveBlob(uuid);
            mimeType = blob.getMimeType();
            length = blob.getLength();
            resource = new InputStreamResource(blob.getContentStream());
            blob = null;
        } finally {
            if (blob != null) try { blob.close(); } catch (Exception e) { }
        }
        return new ContentImpl(mimeType, length, resource);
    }

    @Override
    public IContentInfo retrieveContentInfo(UUID uuid) throws IOException {
        final ContentDesc contentDesc = aquamarine.retrieveContentDesc(uuid);
        return new IContentInfo() {
            @Override
            public String getMimeType() {
                return contentDesc.getMimeType();
            }

            @Override
            public long getLength() {
                return contentDesc.getLength();
            }
        };
    }

    @Override
    @Async
    @Transactional
    public Future<SubmitOperationResult> submitNewCollection(String formName, File temporaryFile) {
        String baseName;
        {
            Matcher m = EXT_PATTERN.matcher(formName);
            if (!m.matches()) {
                return new AsyncResult<>(SubmitOperationResult.makeFail("Only .zip files are accepted"));
            }
            baseName = m.group("base");
        }
        Set<String> possibleConflicts = storageNodeRepository.findAllRootNodesWithTextPattern(baseName + "%").stream()
                .map((StorageNode sn) -> sn.getText()).collect(toSet());
        String storageName;
        if (!possibleConflicts.contains(formName)) {
            storageName = formName;
        } else {
            String candidate = baseName + "(1).zip";
            if (!possibleConflicts.contains(candidate)) {
                storageName = candidate;
            } else {
                storageName = "lastResort_" + Long.toString(System.currentTimeMillis()) + ".zip";
                for (String q : possibleConflicts) {
                    String w;
                    {
                        Matcher m = EXT_PATTERN.matcher(q);
                        if (m.matches()) {
                            w = m.group("base");
                        } else {
                            w = q;
                        }
                    }
                    Matcher m = CONFLICT_RESOLVER_PATTERN.matcher(w);
                    if (m.matches()) {
                        candidate = baseName + "(" + (Integer.parseInt(m.group("num")) + 1) + ").zip";
                        if (!possibleConflicts.contains(candidate)) {
                            storageName = candidate;
                            break;
                        }
                    }
                }
            }
        }
        SubmitOperationResult retVal;
        StorageNode storageNode = storageNodeRepository.save(StorageNode.makeNewZip(storageName, Instant.now()));
        try (ZipFile zipFile = new ZipFile(temporaryFile)) {
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            HashMap<String, Pair<StorageNode, StorageNode> > dirStruct = new HashMap<>();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                processZipEntry(storageNode, zipFile, entry, dirStruct);
            }
            retVal = SubmitOperationResult.makeSuccess();
        } catch (Exception e) {
            retVal = SubmitOperationResult.makeFail(e.getMessage());
        } finally {
            try { temporaryFile.delete(); } catch (Exception e) { }
        }
        return new AsyncResult<>(retVal);
    }

    private String findSuitableStorageName(String formName) {
        return null;
    }

    private void processZipEntry(StorageNode rootNode,
                                 ZipFile zipFile,
                                 ZipEntry entry,
                                 HashMap<String, Pair<StorageNode, StorageNode> > dirStruct) throws IOException {
        String[] path0 = entry.getName().split("/");
        StorageNode parent = rootNode;
        for (int i = 0; i < path0.length; ++i) {
            String key = StringUtils.join(path0, '/', 0, i + 1);
            if (dirStruct.containsKey(key)) {
                parent = dirStruct.get(key).getRight();
            } else {
                StorageNode newChild = entry.isDirectory()
                        ? storageNodeRepository.save(StorageNode.makeNewDirectory(parent, path0[i]))
                        : createAquamarineEntry(parent, zipFile, entry, path0[i]);
                dirStruct.put(key, Pair.of(parent, newChild));
                parent = newChild;
            }
        }
    }

    private StorageNode createAquamarineEntry(StorageNode parent, ZipFile zipFile, ZipEntry zipEntry, String text) throws IOException {
        StorageNode retVal;
        File unpacked = null;
        try (InputStream inputStream = zipFile.getInputStream(zipEntry)) {
            unpacked = new File(System.getProperty("java.io.tmpdir")
                    + File.separator
                    + "unpacked_" + System.currentTimeMillis() + "_tmp" + getSuitableExtension(zipEntry));
            try (FileOutputStream fileOutputStream = new FileOutputStream(unpacked)) {
                StreamUtils.copy(inputStream, fileOutputStream);
            }
            String mimeType = Files.probeContentType(unpacked.toPath());
            long length = unpacked.length();
            try (FileInputStream unpackedFis = new FileInputStream(unpacked)) {
                UUID aqId = aquamarine.createBlob(mimeType, unpackedFis, length);
                retVal = storageNodeRepository.save(
                            mimeType.startsWith("image")
                                ? StorageNode.makeNewImage(parent, text, aqId)
                                : StorageNode.makeNewOther(parent, text, aqId));
            }
        } finally {
            if (unpacked != null) { try { unpacked.delete(); } catch (Exception e0) { } }
        }
        return retVal;
    }



    private static String getSuitableExtension(ZipEntry zipEntry) {
        Matcher m = EXT_PATTERN.matcher(zipEntry.getName());
        if (m.matches()) {
            return m.group("ext");
        } else {
            return ".tmp";
        }
    }

    private static class ContentImpl implements IContent {
        private final String mimeType;
        private final long length;
        private final InputStreamResource resource;

        ContentImpl(String mimeType, long length, InputStreamResource resource) {
            this.mimeType = mimeType;
            this.length = length;
            this.resource = resource;
        }

        @Override
        public String getMimeType() {
            return mimeType;
        }

        @Override
        public long getLength() {
            return length;
        }

        @Override
        public InputStreamResource getData() {
            return resource;
        }
    }
}
