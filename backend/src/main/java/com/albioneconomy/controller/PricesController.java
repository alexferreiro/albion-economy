package com.albioneconomy.controller;

import com.albioneconomy.dto.MarketPriceDTO;
import com.albioneconomy.external.AlbionApiClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prices")
public class PricesController {

    private final AlbionApiClient albionApiClient;

    public PricesController(AlbionApiClient albionApiClient) {
        this.albionApiClient = albionApiClient;
    }

    /**
     * GET /prices?ids=T4_BAG,T4_BAG@1,T4_LEATHER
     *
     * Usamos @RequestParam en lugar de @PathVariable para evitar que Spring
     * rechace el carácter '@' con 403 cuando viene en la URL path.
     */
    @GetMapping
    public List<MarketPriceDTO> getPrices(@RequestParam String ids) {
        return albionApiClient.getItemPrices(ids);
    }
}