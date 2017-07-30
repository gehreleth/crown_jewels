package org.diamond.aquamarine.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.diamond.aquamarine.StorageNode;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContent;
import org.diamond.aquamarine.SubmitOperationResult;
import org.diamond.aquamarineclient.Aquamarine;
import org.diamond.aquamarineclient.Blob;
import org.diamond.persistence.srcimages.ISourceImageCollectionRepository;
import org.diamond.persistence.srcimages.ISourceImageRepository;
import org.diamond.persistence.srcimages.entities.SourceImage;
import org.diamond.persistence.srcimages.entities.SourceImageCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import java.io.*;
import java.nio.file.Files;
import java.util.*;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@Service
public class AquamarineServiceImpl implements IAquamarineService {
    @Autowired
    private Aquamarine aquamarine;

    @Autowired
    private ISourceImageRepository sourceImageRepository;

    @Autowired
    private ISourceImageCollectionRepository sourceImageCollectionRepository;

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
    @Async
    @Transactional
    public Future<SubmitOperationResult> submitNewCollection(String formName, File temporaryFile) {
        SubmitOperationResult retVal;
        SourceImageCollection collection = sourceImageCollectionRepository.save(new SourceImageCollection(formName));
        try (ZipFile zipFile = new ZipFile(temporaryFile)) {
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                if (!entry.isDirectory()) {
                    processZipEntry(collection, zipFile, entry);
                }
            }
            retVal = SubmitOperationResult.makeSuccess();
        } catch (Exception e) {
            retVal = SubmitOperationResult.makeFail(e.getMessage());
        } finally {
            try { temporaryFile.delete(); } catch (Exception e) { }
        }
        return new AsyncResult<>(retVal);
    }

    public List<StorageNode> listContentsAsTree() {
        List<StorageNode> retVal = new ArrayList<>();
        List<SourceImageCollection> allCollections = sourceImageCollectionRepository.findAll();
        long curId = 0L;
        for (SourceImageCollection siColl : allCollections) {
            curId = appendCollection(siColl, retVal, curId);
        }
        return retVal;
    }

    private long appendCollection(SourceImageCollection siColl, List<StorageNode> out, long curId) {
        StorageNode entity = new StorageNode();
        entity.setId(++curId);
        entity.setName(siColl.getFileName());
        out.add(entity);
        List<SourceImage> sourceImages = sourceImageRepository.findAllBySourceImageCollection(siColl);
        long collId = curId;
        HashMap<Long, SourceImage> id2Aquamarine = new HashMap<>();
        HashMap<String, Pair<Long, Long> > dirStruct = new HashMap<>();
        for (SourceImage si : sourceImages) {
            curId = updateDirStruct(collId, curId, si, dirStruct, id2Aquamarine);
        }
        HashMap<Long, String> id2name = new HashMap<>();
        HashMap<Long, Long> child2parent = new HashMap<>();
        for (Map.Entry<String, Pair<Long, Long> > q : dirStruct.entrySet()) {
            String origName = q.getKey();
            Long id = q.getValue().getRight();
            Long parentId = q.getValue().getLeft();
            child2parent.put(id, parentId);
            int lastSlash = origName.lastIndexOf('/');
            id2name.put(id, lastSlash != -1 ? origName.substring(lastSlash + 1) : origName);
        }
        buildBranch(out, collId, child2parent, id2name, id2Aquamarine);
        return curId;
    }

    private void buildBranch(List<StorageNode> out,
                             final long parent,
                             final HashMap<Long, Long> child2parent,
                             final HashMap<Long, String> id2name,
                             final HashMap<Long, SourceImage> id2Aquamarine)
    {
        List<Long> childrenIds = child2parent.entrySet()
                .stream().filter(e -> e.getValue() == parent)
                .map(e -> e.getKey()).sorted((o1, o2) -> {
                    String left = id2name.get(o1);
                    String right = id2name.get(o2);
                    return left.compareTo(right);
                }).collect(Collectors.toList());
        for (Long cid : childrenIds) {
            StorageNode entity = new StorageNode();
            entity.setId(cid);
            entity.setParentId(parent);
            entity.setName(id2name.get(cid));
            boolean isLeaf = id2Aquamarine.containsKey(cid);
            if (isLeaf) {
                entity.setAquamarineId(id2Aquamarine.get(cid).getAquamarineId());
            }
            out.add(entity);
            if (!isLeaf) {
                buildBranch(out, cid, child2parent, id2name, id2Aquamarine);
            }
        }
    }

    private long updateDirStruct(long collId,
                                 long curId,
                                 SourceImage si,
                                 HashMap<String, Pair<Long, Long> > dirStruct,
                                 HashMap<Long, SourceImage> id2Aquamarine)
    {
        Long parentId = collId;
        String[] path0 = si.getOriginalName().split("/");
        for (int i = 1; i <= path0.length; ++i) {
            String key = StringUtils.join(path0, '/', 0, i);
            if (dirStruct.containsKey(key)) {
                parentId = dirStruct.get(key).getRight();
            } else {
                Long newId = ++curId;
                dirStruct.put(key, Pair.of(parentId, newId));
                if (i == path0.length) {
                    id2Aquamarine.put(newId, si);
                }
                parentId = newId;
            }
        }
        return curId;
    }

    private void processZipEntry(SourceImageCollection collection, ZipFile zipFile, ZipEntry zipEntry) throws IOException {
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
                sourceImageRepository.save(new SourceImage(collection, zipEntry.getName(), aqId));
            }
        } finally {
            if (unpacked != null) { try { unpacked.delete(); } catch (Exception e0) { } }
        }
    }

    private static final Pattern EXT_PATTERN = Pattern.compile(".*(?<ext>\\.(\\w{1,4}))$");

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
