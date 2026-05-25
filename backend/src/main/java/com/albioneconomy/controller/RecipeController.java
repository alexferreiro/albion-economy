package com.albioneconomy.controller;

import com.albioneconomy.dto.GameinfoItemData;
import com.albioneconomy.dto.RecipeDTO;
import com.albioneconomy.external.AlbionApiClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recipe")
public class RecipeController {

    private final AlbionApiClient albionApiClient;

    public RecipeController(AlbionApiClient albionApiClient) {
        this.albionApiClient = albionApiClient;
    }

    /**
     * GET /recipe?id=T4_SWORD
     *
     * Usamos @RequestParam para evitar conflictos con caracteres especiales en el path.
     * Siempre se pasa el ID base sin sufijo de encantamiento (@1/@2/@3),
     * ya que todos los encantamientos comparten la misma receta base.
     */
    @GetMapping
    public RecipeDTO getRecipe(@RequestParam String id) {
        GameinfoItemData data = albionApiClient.getItemData(id);

        if (data == null
                || data.getCraftingRequirements() == null
                || data.getCraftingRequirements().getCraftResourceList() == null
                || data.getCraftingRequirements().getCraftResourceList().isEmpty()) {
            return null;
        }

        GameinfoItemData.CraftingRequirements req = data.getCraftingRequirements();

        List<RecipeDTO.RecipeMaterialDTO> materials = req.getCraftResourceList()
                .stream()
                .map(r -> new RecipeDTO.RecipeMaterialDTO(r.getUniqueName(), r.getCount()))
                .toList();

        return new RecipeDTO(id, req.getSilver(), req.getCraftingFocus(), materials);
    }
}