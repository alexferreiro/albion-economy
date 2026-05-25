package com.albioneconomy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeDTO {

    private String itemId;

    private int silver;

    private int craftingFocus;

    private List<RecipeMaterialDTO> materials;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecipeMaterialDTO {
        private String uniqueName;
        private int count;
    }
}