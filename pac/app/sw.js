'use strict';

const CACHE = 'aw139pac-20260929173954';

const PRECACHE = [
  './.last_build_id',
  './favicon.png',
  './flutter.js',
  './flutter_bootstrap.js',
  './flutter_service_worker.js',
  './index.html',
  './main.dart.js',
  './manifest.json',
  './version.json',
  './assets/AssetManifest.bin',
  './assets/AssetManifest.bin.json',
  './assets/FontManifest.json',
  './assets/fonts/MaterialIcons-Regular.otf',
  './assets/packages/cupertino_icons/assets/CupertinoIcons.ttf',
  './assets/shaders/ink_sparkle.frag',
  './assets/shaders/stretch_effect.frag',
  './icons/Icon-192.png',
  './icons/Icon-512.png',
  './icons/Icon-maskable-192.png',
  './icons/Icon-maskable-512.png',
  './icons/maskable_icon_x128.png',
  './icons/maskable_icon_x192.png',
  './icons/maskable_icon_x384.png',
  './icons/maskable_icon_x48.png',
  './icons/maskable_icon_x512.png',
  './icons/maskable_icon_x72.png',
  './icons/maskable_icon_x96.png'
];

const BACKGROUND = [
  './assets/assets/100withEAPS.jpg',
  './assets/assets/100withIBF.jpg',
  './assets/assets/100withoutEAPS.jpg',
  './assets/assets/102withEAPS.jpg',
  './assets/assets/102withIBF.jpg',
  './assets/assets/102withoutEAPS.jpg',
  './assets/assets/aw139_pwr_ass_icon.png',
  './assets/assets/BleedValveGraph.jpg',
  './assets/assets/BleedValveGraph.png',
  './assets/assets/path163-4.jpg',
  './assets/assets/performanceTables.json',
  './assets/assets/s-97-35.svg',
  './assets/assets/s50-63.jpg',
  './assets/assets/s50-63.json',
  './assets/assets/s50-63_chartBounds.json',
  './assets/assets/s69-63.jpg',
  './assets/assets/s69-63.json',
  './assets/assets/s69-63_chartBounds.json',
  './assets/assets/S97-35.jpg',
  './assets/assets/s97-35.json',
  './assets/assets/s97-35_chartBounds.json',
  './assets/assets/hover_ceiling/HC_4-20_IGE_TOP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A.svg',
  './assets/assets/hover_ceiling/HC_4-21_IGE_MCP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A.svg',
  './assets/assets/hover_ceiling/HC_4-22_IGE_2.5%20min_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A.svg',
  './assets/assets/hover_ceiling/HC_4-23_IGE_MCP_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A.svg',
  './assets/assets/hover_ceiling/HC_4-24_OGE_TOP_AEO_100_zero%20wind_electrical%20load%20600A.svg',
  './assets/assets/hover_ceiling/HC_4-25_OGE_MCP_AEO_100_zero%20wind_electrical%20load%20600A.svg',
  './assets/assets/hover_ceiling/HC_4-26_OGE_2.5%20min_OEI_100_zero%20wind_electrical%20load%20300A.svg',
  './assets/assets/hover_ceiling/HC_4-27_OGE_MCP_OEI_100_zero%20wind_electrical%20load%20300A.svg',
  './assets/assets/hover_ceiling/HC_4-68_OGE_2.5%20min_OEI_102_headwind%20factored_electrical%20load%20300A_clean%20configuration_Heater%20off.svg',
  './assets/assets/hover_ceiling/HC_4-69_OGE_2.5%20min_OEI_102_headwind%20unfactored_electrical%20load%20300A_clean%20configuration_Heater%20off.svg',
  './assets/assets/hover_ceiling/HC_9-126_OGE_2.5%20min_OEI_102_headwind%20unfactored_electrical%20load%20300A_Clean%20Intake.svg',
  './assets/assets/hover_ceiling/HC_9-127_OGE_2.5%20min_OEI_102_headwind%20unfactored_electrical%20load%20300A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_9-131_OGE_TOP_AEO_102_zero%20wind_electrical%20load%20600A_Clean%20Intake.svg',
  './assets/assets/hover_ceiling/HC_9-132_OGE_MCP_AEO_102_zero%20wind_electrical%20load%20600A_Clean%20Intake.svg',
  './assets/assets/hover_ceiling/HC_9-133_OGE_TOP_AEO_102_zero%20wind_electrical%20load%20600A_Clean%20Intake_weight%20up%20to%206800kg.svg',
  './assets/assets/hover_ceiling/HC_9-134_OGE_MCP_AEO_102_zero%20wind_electrical%20load%20600A_Clean%20Intake_weight%20up%20to%206800kg.svg',
  './assets/assets/hover_ceiling/HC_S5-110_OGE_2.5%20min_OEI_102_headwind%20factored_electrical%20load%20300A_EAPS%20OFF_Heater%20off.svg',
  './assets/assets/hover_ceiling/HC_S5-111_OGE_2.5%20min_OEI_102_headwind%20unfactored_electrical%20load%20300A_EAPS%20OFF_Heater%20off.svg',
  './assets/assets/hover_ceiling/HC_S5-27_IGE_TOP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-28_IGE_MCP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-29_IGE_2.5%20min_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-30_IGE_MCP_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-31_OGE_TOP_AEO_100_zero%20wind_electrical%20load%20600A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-32_OGE_MCP_AEO_100_zero%20wind_electrical%20load%20600A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-33_OGE_2.5%20min_OEI_100_zero%20wind_electrical%20load%20300A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-34_OGE_MCP_OEI_100_zero%20wind_electrical%20load%20300A_EAPS%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S5-35_IGE_TOP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-36_IGE_MCP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-37_IGE_2.5%20min_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-38_IGE_MCP_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-39_OGE_TOP_AEO_100_zero%20wind_electrical%20load%20600A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-40_OGE_MCP_AEO_100_zero%20wind_electrical%20load%20600A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-41_OGE_2.5%20min_OEI_100_zero%20wind_electrical%20load%20300A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-42_OGE_MCP_OEI_100_zero%20wind_electrical%20load%20300A_EAPS%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-43_IGE_TOP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_EAPS%20OFF%20or%20ON_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-44_IGE_MCP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_EAPS%20OFF%20or%20ON_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-45_OGE_TOP_AEO_100_zero%20wind_electrical%20load%20600A_EAPS%20OFF%20or%20ON_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S5-46_OGE_MCP_AEO_100_zero%20wind_electrical%20load%20600A_EAPS%20OFF%20or%20ON_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S86-18_IGE_TOP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-19_IGE_MCP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-20_IGE_2.5%20min_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-21_IGE_MCP_OEI_100_zero%20wind_wheel%20height%205ft_electrical%20load%20300A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-22_OGE_TOP_AEO_100_zero%20wind_electrical%20load%20600A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-23_OGE_MCP_AEO_100_zero%20wind_electrical%20load%20600A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-24_OGE_2.5%20min_OEI_100_zero%20wind_electrical%20load%20300A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-25_OGE_MCP_OEI_100_zero%20wind_electrical%20load%20300A_IBF.svg',
  './assets/assets/hover_ceiling/HC_S86-26_IGE_TOP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_IBF_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S86-27_IGE_MCP_AEO_100_zero%20wind_wheel%20height%205ft_electrical%20load%20600A_IBF_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S86-28_OGE_TOP_AEO_100_zero%20wind_electrical%20load%20600A_IBF_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S86-29_OGE_MCP_AEO_100_zero%20wind_electrical%20load%20600A_IBF_Heater%20ON.svg',
  './assets/assets/hover_ceiling/HC_S86-30_OGE_2.5%20min_OEI_102_headwind%20factored_electrical%20load%20300A_IBF_Heater%20OFF.svg',
  './assets/assets/hover_ceiling/HC_S86-31_OGE_2.5%20min_OEI_102_headwind%20unfactored_electrical%20load%20300A_IBF_Heater%20OFF.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(
        PRECACHE.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('[sw] failed to cache:', url, err)
          )
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
  event.waitUntil(backgroundPrecache());
});

async function backgroundPrecache() {
  const cache = await caches.open(CACHE);
  for (const url of BACKGROUND) {
    try {
      if (await cache.match(url)) continue;
      await cache.add(url);
    } catch (err) {
      console.warn('[sw] background cache failed:', url, err);
    }
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(CACHE).then((cache) =>
            cache.put(event.request, response.clone())
          );
        }
        return response;
      })
    )
  );
});
