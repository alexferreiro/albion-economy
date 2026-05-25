package com.albioneconomy.external;

import com.albioneconomy.dto.GameinfoItemData;
import com.albioneconomy.dto.MarketPriceDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;

@Component
public class AlbionApiClient {

    private final WebClient webClient;

    private static final String PRICES_BASE   = "https://www.albion-online-data.com/api/v2/stats/prices/";
    private static final String GAMEINFO_BASE = "https://gameinfo.albiononline.com/api/gameinfo/items/";

    public AlbionApiClient(WebClient webClient) {
        this.webClient = webClient;
    }

    public List<MarketPriceDTO> getItemPrices(String itemIds) {
        String url = PRICES_BASE + itemIds;
        try {
            List<MarketPriceDTO> result = webClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<MarketPriceDTO>>() {})
                    .block();
            return result != null ? result : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    public GameinfoItemData getItemData(String itemId) {
        String baseId = itemId.contains("@") ? itemId.substring(0, itemId.indexOf('@')) : itemId;
        String url = GAMEINFO_BASE + baseId + "/data";
        try {
            return webClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(GameinfoItemData.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}