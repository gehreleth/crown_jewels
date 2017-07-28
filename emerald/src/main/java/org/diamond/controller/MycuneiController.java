package org.diamond.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

@Controller
public class MycuneiController {
	@GetMapping("/")
	public String root(ModelMap model) {
		return "index.html";
	}
}