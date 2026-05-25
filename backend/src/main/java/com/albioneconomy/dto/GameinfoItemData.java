package com.albioneconomy.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameinfoItemData {
    @JsonProperty("craftingRequirements")
    private CraftingRequirements craftingRequirements;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CraftingRequirements {

        @JsonProperty("silver")
        private int silver;

        @JsonProperty("craftingFocus")
        private int craftingFocus;

        @JsonProperty("craftResourceList")
        private List<CraftResource> craftResourceList;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CraftResource {

        @JsonProperty("uniqueName")
        private String uniqueName;

        @JsonProperty("count")
        private int count;
    }
}
