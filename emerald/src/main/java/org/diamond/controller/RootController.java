package org.diamond.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {
    @GetMapping(value={"", "/", "index.html"})
    public String root() {
        return "forward:/static/index.html";
    }
}
