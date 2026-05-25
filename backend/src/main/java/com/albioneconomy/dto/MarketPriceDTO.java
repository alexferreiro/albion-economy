package com.albioneconomy.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MarketPriceDTO {

    @JsonProperty("item_id")
    private String itemId;

    @JsonProperty("city")
    private String city;

    @JsonProperty("quality")
    private Integer quality;

    @JsonProperty("sell_price_min")
    private Long sellPriceMin;

    @JsonProperty("sell_price_max")
    private Long sellPriceMax;

    @JsonProperty("buy_price_min")
    private Long buyPriceMin;

    @JsonProperty("buy_price_max")
    private Long buyPriceMax;
}