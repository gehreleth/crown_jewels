package org.diamond.controller;

import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContentInfo;
import org.diamond.controller.repr.NodeJsonRepr;
import org.diamond.persistence.srcimages.IStorageNodeRepository;
import org.diamond.persistence.srcimages.entities.StorageNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RestController
@RequestMapping("/storage")
public class LazyTreeBrowser {
    private static final Logger LOGGER = LoggerFactory.getLogger(LazyTreeBrowser.class);

    @Autowired
    private IAquamarineService aquamarineService;

    @Autowired
    private IStorageNodeRepository storageNodeRepository;

    @GetMapping(value = "/populate-root")
    public List<NodeJsonRepr> populateRoot() {
        List<NodeJsonRepr> retVal;
        try {
            retVal = collectNodes(storageNodeRepository.findAllRootNodes());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return retVal;
    }

    @GetMapping(value = "/populate-children/{parentId}")
    @Transactional(readOnly = true)
    public List<NodeJsonRepr> populateChildren(@PathVariable Long parentId) {
        List<NodeJsonRepr> retVal;
        try {
            retVal = collectNodes(storageNodeRepository.findOne(parentId).getChildren());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return retVal;
    }

    @GetMapping(value = "/populate-branch/{terminalNodeId}")
    @Transactional(readOnly = true)
    public NodeJsonRepr populateBranch(@PathVariable Long terminalNodeId) {
        NodeJsonRepr retVal;
        try {
            ArrayList<StorageNode> branch = new ArrayList<>();
            StorageNode node = storageNodeRepository.findOne(terminalNodeId);
            while (node != null) {
                branch.add(node);
                node = node.getParent();
            }
            Collections.reverse(branch); // Order : from root to leaf
            retVal = mergeEachBranchNodeWithSiblings(branch);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return retVal;
    }

    private NodeJsonRepr mergeEachBranchNodeWithSiblings(Collection<StorageNode> branch) {
        return mergeEachBranchNodeWithSiblings0(branch.iterator());
    }

    private NodeJsonRepr mergeEachBranchNodeWithSiblings0(Iterator<StorageNode> branchItr) {
        NodeJsonRepr retVal = null;
        if (branchItr.hasNext()) {
           StorageNode sn = branchItr.next();
           NodeJsonRepr branchNode = convertNodeToJson(sn);
           NodeJsonRepr nextBranchNode = mergeEachBranchNodeWithSiblings0(branchItr);
           if (nextBranchNode != null) {
               List<NodeJsonRepr> nextBranchNodeSiblings = collectNodes(sn.getChildren());
               Long nextBranchNodeId = nextBranchNode.getId();
               for (int i = 0; i < nextBranchNodeSiblings.size(); ++i) {
                   Long id = nextBranchNodeSiblings.get(i).getId();
                   if (nextBranchNodeId.equals(id)) {
                       nextBranchNodeSiblings.set(i, nextBranchNode);
                       break;
                   }
               }
               branchNode.setChildren(nextBranchNodeSiblings.toArray(new NodeJsonRepr[nextBranchNodeSiblings.size()]));
           }
           retVal = branchNode;
        }
        return retVal;
    }

    private List<NodeJsonRepr> collectNodes(Collection<StorageNode> arg) {
        final ArrayList<NodeJsonRepr> retVal = new ArrayList<>();
        arg.stream().map(this::convertNodeToJson).forEach(retVal::add);
        return retVal;
    }

    private NodeJsonRepr convertNodeToJson(StorageNode storageNode) {
        NodeJsonRepr jso;
        try {
            UUID aquamarineId = storageNode.getAquamarineId();
            Long contentLength = null;
            String mimeType = null;
            if (aquamarineId != null) {
                IContentInfo contentInfo = aquamarineService.retrieveContentInfo(aquamarineId);
                contentLength = contentInfo.getLength();
                mimeType = contentInfo.getMimeType();
            }
            jso = new NodeJsonRepr();
            jso.setId(storageNode.getId());
            jso.setType(storageNode.getNodeType());
            jso.setText(storageNode.getText());
            jso.setChildren(null);
            jso.setAquamarineId(aquamarineId);
            jso.setContentLength(contentLength);
            jso.setMimeType(mimeType);
        } catch (Exception e1) {
            throw new RuntimeException(e1);
        }
        return jso;
    }
}
