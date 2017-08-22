package org.diamond.controller;

import com.google.gson.*;
import org.apache.http.HttpStatus;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContentInfo;
import org.diamond.persistence.srcimages.IStorageNodeRepository;
import org.diamond.persistence.srcimages.entities.StorageNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Controller
@RequestMapping("/storage")
public class LazyTreeBrowser {
    private static final Logger LOGGER = LoggerFactory.getLogger(LazyTreeBrowser.class);

    @Autowired
    private IAquamarineService aquamarineService;

    @Autowired
    private IStorageNodeRepository storageNodeRepository;

    @GetMapping(value = "/populate-root")
    public ResponseEntity<String> populateRoot() {
        ResponseEntity<String> retVal;
        try {
            JsonElement je = collectNodes(storageNodeRepository.findAllRootNodes());
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(je.toString());
        } catch (Exception e) {
            LOGGER.error("populateRoot", e);
            retVal = ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN).body(e.getMessage());
        }
        return retVal;
    }

    @GetMapping(value = "/populate-children/{parentId}")
    @Transactional(readOnly = true)
    public ResponseEntity<String> populateChildren(@PathVariable Long parentId) {
        ResponseEntity<String> retVal;
        try {
            JsonElement je = collectNodes(storageNodeRepository.findOne(parentId).getChildren());
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(je.toString());
        } catch (Exception e) {
            LOGGER.error("populateChildren", e);
            retVal = ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN).body(e.getMessage());
        }
        return retVal;
    }

    @GetMapping(value = "/populate-branch/{terminalNodeId}")
    @Transactional(readOnly = true)
    public ResponseEntity<String> populateBranch(@PathVariable Long terminalNodeId) {
        ResponseEntity<String> retVal;
        try {
            ArrayList<StorageNode> branch = new ArrayList<>();
            StorageNode node = storageNodeRepository.findOne(terminalNodeId);
            while (node != null) {
                branch.add(node);
                node = node.getParent();
            }
            Collections.reverse(branch); // Order : from root to leaf
            JsonElement jse = mergeEachBranchNodeWithSiblings(branch);
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(jse.toString());
        } catch (Exception e) {
            LOGGER.error("populateBranch", e);
            retVal = ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN).body(e.getMessage());
        }
        return retVal;
    }

    private JsonElement mergeEachBranchNodeWithSiblings(Collection<StorageNode> branch) {
        return mergeEachBranchNodeWithSiblings0(branch.iterator());
    }

    private JsonElement mergeEachBranchNodeWithSiblings0(Iterator<StorageNode> branchItr) {
        JsonElement retVal = JsonNull.INSTANCE;
        if (branchItr.hasNext()) {
           StorageNode sn = branchItr.next();
           JsonObject branchNode = convertNodeToJson(sn);
           JsonElement nextBranchNode = mergeEachBranchNodeWithSiblings0(branchItr);
           if (!nextBranchNode.isJsonNull()) {
               JsonArray nextBranchNodeSiblings = collectNodes(sn.getChildren());
               Long nextBranchNodeId = getIdField(nextBranchNode);
               for (int i = 0; i < nextBranchNodeSiblings.size(); ++i) {
                   Long id = getIdField(nextBranchNodeSiblings.get(i));
                   if (nextBranchNodeId.equals(id)) {
                       nextBranchNodeSiblings.set(i, nextBranchNode);
                       break;
                   }
               }
               branchNode.add("children", nextBranchNodeSiblings);
           }
           retVal = branchNode;
        }
        return retVal;
    }

    private static Long getIdField(JsonElement jse) {
        Long retVal = null;
        try {
            JsonObject oo = jse.isJsonObject() ? jse.getAsJsonObject() : null;
            if (oo != null) {
                JsonElement eeid = oo.has("id") ? oo.get("id") : null;
                retVal = eeid != null ? eeid.getAsLong() : null;
            }
        } catch (Exception e) {
            LOGGER.error("Bad typecast", e);
        }
        return retVal;
    }

    private JsonArray collectNodes(Collection<StorageNode> arg) {
        final JsonArray retVal = new JsonArray();
        arg.stream().map(this::convertNodeToJson).forEach(retVal::add);
        return retVal;
    }

    private JsonObject convertNodeToJson(StorageNode storageNode) {
        JsonObject jso;
        try {
            UUID aquamarineId = storageNode.getAquamarineId();
            Long contentLength = null;
            String mimeType = null;
            String aquamarineIdStr = null;
            if (aquamarineId != null) {
                aquamarineIdStr = aquamarineId.toString();
                IContentInfo contentInfo = aquamarineService.retrieveContentInfo(aquamarineId);
                contentLength = contentInfo.getLength();
                mimeType = contentInfo.getMimeType();
            }
            jso = new JsonObject();
            jso.addProperty("id", storageNode.getId());
            jso.addProperty("type", storageNode.getNodeType().toString());
            jso.addProperty("text", storageNode.getText());
            jso.add("children", JsonNull.INSTANCE);
            jso.addProperty("aquamarineId", aquamarineIdStr);
            jso.addProperty("contentLength", contentLength);
            jso.addProperty("mimeType", mimeType);
        } catch (Exception e1) {
            throw new RuntimeException(e1);
        }
        return jso;
    }
}
