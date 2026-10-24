const CACHE_NAME = 'aw139-root-7d8be7ca64';
const PRECACHE = [
  "./shared/offline-status.js",
  "./dropdown/assets/dropdown-enhanced-7000.png",
  "./dropdown/assets/dropdown-offshore-6400.png",
  "./dropdown/assets/dropdown-offshore-6800.png",
  "./adc/",
  "./cata/",
  "./decolagem-offshore/",
  "./dropdown/",
  "./pouso-offshore/",
  "./rto/",
  "./wat/",
  "./dropdown/index.html",
  "./dropdown/app.js",
  "./dropdown/styles.css",
  "./dropdown/ddv7-fullscreen-fix.js",
  "./dropdown/ddv7-patch.js",
  "./dropdown/final-ui.js",
  "./assets/ubuntu.css",
  "./assets/fonts/ubuntu-400-latin-ext.woff2",
  "./assets/fonts/ubuntu-400-latin.woff2",
  "./assets/fonts/ubuntu-500-latin-ext.woff2",
  "./assets/fonts/ubuntu-500-latin.woff2",
  "./assets/fonts/ubuntu-500i-latin-ext.woff2",
  "./assets/fonts/ubuntu-500i-latin.woff2",
  "./assets/fonts/ubuntu-700-latin-ext.woff2",
  "./assets/fonts/ubuntu-700-latin.woff2",
  "./",
  "./README.md",
  "./adc/app.js",
  "./adc/app.js.bak",
  "./adc/base_pack_template_v3.json",
  "./adc/base_pack_template_v4.json",
  "./adc/base_pack_template_v5.json",
  "./adc/index.html",
  "./adc/theme.css",
  "./adc/sbcb_builtin_pack_v3.json",
  "./adc/sbcb_builtin_pack_v4.json",
  "./adc/sbcb_builtin_pack_v5.json",
  "./adc/sbcb_chart_p1.png",
  "./adc/sbcb_chart_p2.png",
  "./adc/sbfs_builtin_pack_v3.json",
  "./adc/sbfs_builtin_pack_v4.json",
  "./adc/sbfs_builtin_pack_v5.json",
  "./adc/sbfs_chart_p1.png",
  "./adc/sbfs_chart_p2.png",
  "./adc/sbgl_builtin_pack_v3.json",
  "./adc/sbgl_builtin_pack_v4.json",
  "./adc/sbgl_builtin_pack_v5.json",
  "./adc/sbgl_chart_p1.png",
  "./adc/sbgl_chart_p2.png",
  "./adc/sbjr_builtin_pack_v3.json",
  "./adc/sbjr_builtin_pack_v4.json",
  "./adc/sbjr_builtin_pack_v5.json",
  "./adc/sbjr_chart_p1.png",
  "./adc/sbjr_chart_p2.png",
  "./adc/sbme_builtin_pack_v3.json",
  "./adc/sbme_builtin_pack_v4.json",
  "./adc/sbme_builtin_pack_v5.json",
  "./adc/sbme_chart_p1.png",
  "./adc/sbme_chart_p2.png",
  "./adc/sbmi_builtin_pack_v3.json",
  "./adc/sbmi_builtin_pack_v4.json",
  "./adc/sbmi_builtin_pack_v5.json",
  "./adc/sbmi_chart_p1.png",
  "./adc/sbmi_chart_p2.png",
  "./adc/sbnf_builtin_pack_v3.json",
  "./adc/sbnf_builtin_pack_v4.json",
  "./adc/sbnf_builtin_pack_v5.json",
  "./adc/sbnf_chart_p1.png",
  "./adc/sbnf_chart_p2.png",
  "./adc/sbrj_builtin_pack_v3.json",
  "./adc/sbrj_builtin_pack_v4.json",
  "./adc/sbrj_builtin_pack_v5.json",
  "./adc/sbrj_chart_p1.png",
  "./adc/sbrj_chart_p2.png",
  "./adc/sbvt_builtin_pack_v3.json",
  "./adc/sbvt_builtin_pack_v4.json",
  "./adc/sbvt_builtin_pack_v5.json",
  "./adc/sbvt_chart_p1.png",
  "./adc/sbvt_chart_p2.png",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-32.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-192.png",
  "./assets/icon-maskable-512.png",
  "./assets/icon-source.png",
  "./assets/icon.svg",
  "./assets/icons.svg",
  "./cata/app.js",
  "./cata/index.html",
  "./cata/styles.css",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./pouso-offshore/index.html",
  "./pouso-offshore/app.js",
  "./pouso-offshore/styles.css",
  "./decolagem-offshore/index.html",
  "./decolagem-offshore/app.js",
  "./decolagem-offshore/styles.css",
  "./rto/README.md",
  "./rto/app.js",
  "./rto/assets/icon-180.png",
  "./rto/assets/icon-192.png",
  "./rto/assets/icon-32.png",
  "./rto/assets/icon-512.png",
  "./rto/assets/icon-maskable-192.png",
  "./rto/assets/icon-maskable-512.png",
  "./rto/assets/icon-source.png",
  "./rto/assets/icon.svg",
  "./rto/data/figure_4_54_engine_data.json",
  "./rto/data/figure_4_54_vector_geometry.json",
  "./rto/data/figure_4_54_vector_linework.json",
  "./rto/data/figure_4_56_engine_data.json",
  "./rto/data/figure_4_58_engine_data.json",
  "./rto/data/figure_4_68a_engine_data.json",
  "./rto/data/figure_4_92_engine_data.json",
  "./rto/data/figure_4_94_engine_data.json",
  "./rto/data/figure_4_94_reference.json",
  "./rto/data/figure_4_96_engine_data.json",
  "./rto/data/figure_4_96_reference.json",
  "./rto/data/figure_4_98_engine_data.json",
  "./rto/data/figure_4_98_reference.json",
  "./rto/docs/figure_4_58_center_right_corrected_reference_v17.png",
  "./rto/docs/figure_4_58_left_semantic_corrected_v15.png",
  "./rto/docs/figure_4_94_combined_fresh_v46.png",
  "./rto/docs/figure_4_94_semantic_fresh_v46.png",
  "./rto/docs/figure_4_94_vector_only_fresh_v46.png",
  "./rto/docs/figure_4_96_combined_fresh_v54.png",
  "./rto/docs/figure_4_96_semantic_audit_sheet_v56.png",
  "./rto/docs/figure_4_96_semantic_fresh_v54.png",
  "./rto/docs/figure_4_96_vector_precise_v55.png",
  "./rto/docs/figure_4_98_center_semantic_audit_v62.png",
  "./rto/docs/figure_4_98_left_semantic_audit_v62.png",
  "./rto/docs/figure_4_98_right_semantic_audit_v62.png",
  "./rto/docs/figure_4_98_semantic_audit_sheet_v62.png",
  "./rto/docs/figure_4_98_vector_exact_v62.png",
  "./rto/docs/page_s50_108a_figure_4_68a.png",
  "./rto/docs/page_s50_85_figure_4_54.png",
  "./rto/docs/page_s50_89_figure_4_56.png",
  "./rto/docs/page_s50_93_figure_4_58.png",
  "./rto/docs/page_s90_123_figure_4_92.png",
  "./rto/docs/page_s90_127_figure_4_94.png",
  "./rto/docs/page_s90_131_figure_4_96.png",
  "./rto/docs/page_s90_135_figure_4_98.png",
  "./rto/index.html",
  "./rto/manifest.webmanifest",
  "./rto/styles.css",
  "./dropdown/graphData.js",
  "./shared/home.js",
  "./shared/module-bridge.js",
  "./shared/module-layout.css",
  "./shared/omni-theme.css",
  "./shared/embedded-app.js",
  "./shared/embedded-app.css",
  "./shared/embedded-skin.css",
  "./shared/landing-oei.js",
  "./cat-a/",
  "./cat-a/index.html",
  "./backup/",
  "./backup/index.html",
  "./backup/bu-data.js",
  "./backup/bu-engine.js",
  "./backup/bu-ui.js",
  "./backup/charts/4C-3.webp",
  "./backup/charts/4C-4.webp",
  "./backup/charts/4C-5.webp",
  "./backup/charts/4C-5A.webp",
  "./backup/charts/4C-6.webp",
  "./confined/",
  "./confined/index.html",
  "./confined/ca-data.js",
  "./confined/ca-alt-data.js",
  "./confined/ca-after.js",
  "./confined/charts/4D-10.webp",
  "./confined/charts/4D-11.webp",
  "./confined/charts/4D-12.webp",
  "./confined/charts/4D-13.webp",
  "./confined/charts/4D-14.webp",
  "./confined/charts/4D-15.webp",
  "./confined/charts/4D-16.webp",
  "./confined/charts/4D-17.webp",
  "./confined/charts/4D-18.webp",
  "./confined/charts/4D-19.webp",
  "./confined/charts/4D-20.webp",
  "./confined/charts/4D-21.webp",
  "./confined/charts/4D-22.webp",
  "./confined/charts/4D-23.webp",
  "./confined/charts/4D-24.webp",
  "./confined/charts/4D-25.webp",
  "./confined/charts/4D-26.webp",
  "./confined/charts/4D-27.webp",
  "./confined/charts/4D-28.webp",
  "./confined/charts/4D-29.webp",
  "./confined/charts/4D-30.webp",
  "./confined/charts/4D-31.webp",
  "./confined/charts/4D-32.webp",
  "./confined/charts/4D-33.webp",
  "./confined/ca-engine.js",
  "./confined/charts/4D-4.webp",
  "./confined/charts/4D-5.webp",
  "./confined/charts/4D-6.webp",
  "./confined/charts/4D-6A.webp",
  "./confined/charts/4D-9.webp",
  "./vertical/",
  "./vertical/index.html",
  "./vertical/vt-data.js",
  "./vertical/vt-engine.js",
  "./vertical/vt-ui.js",
  "./vertical/charts/4A-3.webp",
  "./vertical/charts/4A-4.webp",
  "./vertical/charts/4A-5.webp",
  "./vertical/charts/4A-5A.webp",
  "./vertical/charts/4A-6.webp",
  "./vertical/vt-p1.js",
  "./vertical/vt-p2.js",
  "./pouso-confined/",
  "./pouso-heliport/",
  "./pouso-heliport/index.html",
  "./pouso-heliport/hb-data.js",
  "./pouso-heliport/hb-engine.js",
  "./pouso-heliport/hb-ui.js",
  "./pouso-heliport/charts/4G-2.webp",
  "./pouso-confined/index.html",
  "./pouso-confined/cl-data.js",
  "./pouso-confined/pc-engine.js",
  "./pouso-confined/pc-ui.js",
  "./pouso-confined/charts/4H-4.webp",
  "./vertical/charts/4K-5.webp",
  "./vertical/charts/4K-6.webp",
  "./vertical/charts/4K-7.webp",
  "./vertical/charts/4K-8.webp",
  "./vertical/charts/4K-9.webp",
  "./vertical/charts/4K-10.webp",
  "./vertical/charts/4K-11.webp",
  "./vertical/charts/4K-12.webp",
  "./vertical/charts/4K-13.webp",
  "./vertical/charts/4K-14.webp",
  "./vertical/charts/4K-15.webp",
  "./vertical/charts/4K-16.webp",
  "./vertical/charts/4K-17.webp",
  "./vertical/charts/4K-18.webp",
  "./vertical/charts/4K-19.webp",
  "./vertical/charts/4K-20.webp",
  "./vertical/charts/4K-21.webp",
  "./vertical/charts/4K-22.webp",
  "./vertical/charts/4K-23.webp",
  "./vertical/charts/4K-24.webp",
  "./vertical/charts/4K-25.webp",
  "./vertical/charts/4K-26.webp",
  "./vertical/charts/4K-27.webp",
  "./vertical/charts/4K-28.webp",
  "./vertical/charts/4A-8.webp",
  "./vertical/charts/4A-9.webp",
  "./vertical/charts/4A-10.webp",
  "./vertical/charts/4A-11.webp",
  "./vertical/charts/4A-12.webp",
  "./vertical/charts/4A-13.webp",
  "./vertical/charts/4A-14.webp",
  "./vertical/charts/4A-15.webp",
  "./vertical/charts/4A-16.webp",
  "./vertical/charts/4A-17.webp",
  "./vertical/charts/4A-18.webp",
  "./vertical/charts/4A-19.webp",
  "./vertical/charts/4A-20.webp",
  "./vertical/charts/4A-21.webp",
  "./vertical/charts/4A-22.webp",
  "./vertical/charts/4A-23.webp",
  "./vertical/charts/4A-24.webp",
  "./vertical/charts/4A-25.webp",
  "./vertical/charts/4A-26.webp",
  "./vertical/charts/4A-27.webp",
  "./vertical/charts/4A-28.webp",
  "./vertical/charts/4A-29.webp",
  "./vertical/charts/4A-30.webp",
  "./vertical/charts/4A-31.webp",
  "./shortfield/",
  "./shortfield/index.html",
  "./shortfield/sf.css",
  "./shortfield/sf-data.js",
  "./shortfield/sf-engine.js",
  "./shortfield/sf-ui.js",
  "./shortfield/charts/4B-1.webp",
  "./shortfield/charts/4B-2.webp",
  "./shortfield/charts/4B-3.webp",
  "./shortfield/charts/4B-3A.webp",
  "./shortfield/charts/4B-4.webp",
  "./shortfield/charts/4B-5.webp",
  "./shortfield/charts/4B-6.webp",
  "./shortfield/charts/4B-6A.webp",
  "./shortfield/charts/4B-7.webp",
  "./shared/tiles.css",
  "./catb/",
  "./catb/index.html",
  "./catb/app-data.js",
  "./power-check/",
  "./power-check/index.html",
  "./power-check/app-data.js",
  "./power-check/pwc-data.js",
  "./power-check/pwc-engine.js",
  "./power-check/charts/NONE.webp",
  "./power-check/charts/EAPS.webp",
  "./power-check/charts/IBF.webp",
  "./ndl/",
  "./ndl/index.html",
  "./ndl/app-data.js",
  "./roc/",
  "./roc/index.html",
  "./roc/app-data.js",
  "./consumo/",
  "./consumo/index.html",
  "./consumo/app-data.js",
  "./teto-pairado/",
  "./teto-pairado/index.html",
  "./teto-pairado/app-data.js",
  "./teto-pairado/hl-data.js",
  "./teto-pairado/hl-engine.js",
  "./teto-pairado/hl-ui.js",
  "./teto-pairado/charts/4-43.webp",
  "./teto-pairado/charts/S50-4-37.webp",
  "./limitacoes/",
  "./limitacoes/index.html",
  "./limitacoes/app-data.js",
  "./shared/offshore-calc.js",
  "./shared/pwa.css",
  "./shared/pwa.js",
  "./styles.css",
  "./sw.js",
  "./wat/README.md",
  "./wat/app.js",
  "./wat/assets/icon-180.png",
  "./wat/assets/icon-192.png",
  "./wat/assets/icon-32.png",
  "./wat/assets/icon-512.png",
  "./wat/assets/icon-maskable-192.png",
  "./wat/assets/icon-maskable-512.png",
  "./wat/assets/icon-source.png",
  "./wat/assets/icon.svg",
  "./wat/assets/offshore_standard_chart_clip.png",
  "./wat/data/chart-schema.json",
  "./wat/data/clear-eapsoff-exact.json",
  "./wat/data/clear-eapson-exact.json",
  "./wat/data/clear-standard-exact.json",
  "./wat/data/confined-eapsoff-6400-exact.json",
  "./wat/data/confined-eapsoff-exact.json",
  "./wat/data/confined-eapson-6400-exact.json",
  "./wat/data/confined-eapson-exact.json",
  "./wat/data/confined-ibf-6400-exact.json",
  "./wat/data/confined-standard-6400-exact.json",
  "./wat/data/confined-standard-exact.json",
  "./wat/data/eaps-off-exact.json",
  "./wat/data/ibf-cleararea-exact.json",
  "./wat/data/ibf-confined-exact.json",
  "./wat/data/ibf-installed-exact.json",
  "./wat/data/sup90-clear-eapsoff-exact.json",
  "./wat/data/sup90-clear-eapson-exact.json",
  "./wat/data/sup90-clear-ibf-exact.json",
  "./wat/data/sup90-clear-standard-exact.json",
  "./wat/data/sup90-cleararea-stageA.json",
  "./wat/data/sup90-cleararea-stageB.json",
  "./wat/docs/Confined 6400 charts.pdf",
  "./wat/docs/WAC charts 6800.pdf",
  "./wat/docs/WAT enhanced.pdf",
  "./wat/docs/page-01.png",
  "./wat/docs/page-02.png",
  "./wat/docs/page-03.png",
  "./wat/docs/page-04.png",
  "./wat/docs/page-05.png",
  "./wat/docs/page-06.png",
  "./wat/docs/page-07.png",
  "./wat/docs/page-08.png",
  "./wat/docs/page-09.png",
  "./wat/docs/page-10.png",
  "./wat/docs/page-11.png",
  "./wat/docs/page-12.png",
  "./wat/docs/page-13.png",
  "./wat/docs/page-14.png",
  "./wat/docs/page-15.png",
  "./wat/docs/page-16.png",
  "./wat/docs/page-17.png",
  "./wat/docs/page-18.png",
  "./wat/docs/page-19.png",
  "./wat/docs/page-20.png",
  "./wat/docs/page-21.png",
  "./wat/docs/page-22.png",
  "./wat/docs/page-23.png",
  "./wat/docs/page-24.png",
  "./wat/docs/page-25.png",
  "./wat/docs/page-26.png",
  "./wat/docs/page-27.png",
  "./wat/docs/page-28.png",
  "./wat/docs/page-29.png",
  "./wat/docs/page-30.png",
  "./wat/docs/page-31.png",
  "./wat/docs/page-32.png",
  "./wat/docs/page-33.png",
  "./wat/docs/wat7000.pdf",
  "./wat/index.html",
  "./wat/manifest.webmanifest",
  "./wat/styles.css",
  "./wat/test_overlay_case.png"
];
// Gerado por tools/sw-hashes.py.
const HASHES = {"./shared/offline-status.js":"e0dcf273cc","./dropdown/assets/dropdown-enhanced-7000.png":"453f2c2272","./dropdown/assets/dropdown-offshore-6400.png":"9917f039a5","./dropdown/assets/dropdown-offshore-6800.png":"47849e37a6","./adc/":"d8949fb248","./cata/":"81ea0af210","./decolagem-offshore/":"227d467db3","./dropdown/":"a4616c0320","./pouso-offshore/":"702e3dbde3","./rto/":"bb0a239415","./wat/":"f4e5ad2e9b","./dropdown/index.html":"a4616c0320","./dropdown/app.js":"6a62ecc107","./dropdown/styles.css":"96d0905f64","./dropdown/ddv7-fullscreen-fix.js":"17641e73b5","./dropdown/ddv7-patch.js":"7dcde30659","./dropdown/final-ui.js":"7bfd4866d9","./assets/ubuntu.css":"bdff0152fa","./assets/fonts/ubuntu-400-latin-ext.woff2":"530aea4a33","./assets/fonts/ubuntu-400-latin.woff2":"4a8b9af22b","./assets/fonts/ubuntu-500-latin-ext.woff2":"882901bfb9","./assets/fonts/ubuntu-500-latin.woff2":"c6bd3f0bf0","./assets/fonts/ubuntu-500i-latin-ext.woff2":"62817d2060","./assets/fonts/ubuntu-500i-latin.woff2":"6f40fb42fb","./assets/fonts/ubuntu-700-latin-ext.woff2":"49dea29c68","./assets/fonts/ubuntu-700-latin.woff2":"9418887ae6","./":"a28ecfca81","./README.md":"3f8d17d0a6","./adc/app.js":"056d49ad6a","./adc/app.js.bak":"b6d408316d","./adc/base_pack_template_v3.json":"a64cff8968","./adc/base_pack_template_v4.json":"88092aa5d5","./adc/base_pack_template_v5.json":"ef6736957d","./adc/index.html":"d8949fb248","./adc/theme.css":"b488eb0ea0","./adc/sbcb_builtin_pack_v3.json":"daf053efe1","./adc/sbcb_builtin_pack_v4.json":"daf053efe1","./adc/sbcb_builtin_pack_v5.json":"daf053efe1","./adc/sbcb_chart_p1.png":"6247bdafc8","./adc/sbcb_chart_p2.png":"2a64afde63","./adc/sbfs_builtin_pack_v3.json":"6dfd7a78ec","./adc/sbfs_builtin_pack_v4.json":"6dfd7a78ec","./adc/sbfs_builtin_pack_v5.json":"6dfd7a78ec","./adc/sbfs_chart_p1.png":"11d16c614e","./adc/sbfs_chart_p2.png":"31980d1526","./adc/sbgl_builtin_pack_v3.json":"fa216d8e96","./adc/sbgl_builtin_pack_v4.json":"fa216d8e96","./adc/sbgl_builtin_pack_v5.json":"fa216d8e96","./adc/sbgl_chart_p1.png":"6278b0ab47","./adc/sbgl_chart_p2.png":"924152f28a","./adc/sbjr_builtin_pack_v3.json":"fa84f43a97","./adc/sbjr_builtin_pack_v4.json":"fa84f43a97","./adc/sbjr_builtin_pack_v5.json":"fa84f43a97","./adc/sbjr_chart_p1.png":"1d6d725659","./adc/sbjr_chart_p2.png":"2222bf471b","./adc/sbme_builtin_pack_v3.json":"737081b15b","./adc/sbme_builtin_pack_v4.json":"737081b15b","./adc/sbme_builtin_pack_v5.json":"737081b15b","./adc/sbme_chart_p1.png":"81bb110530","./adc/sbme_chart_p2.png":"a598ab6513","./adc/sbmi_builtin_pack_v3.json":"4e425738ec","./adc/sbmi_builtin_pack_v4.json":"4e425738ec","./adc/sbmi_builtin_pack_v5.json":"4e425738ec","./adc/sbmi_chart_p1.png":"33352141e0","./adc/sbmi_chart_p2.png":"33057d9afd","./adc/sbnf_builtin_pack_v3.json":"5960e76e05","./adc/sbnf_builtin_pack_v4.json":"ea4527169e","./adc/sbnf_builtin_pack_v5.json":"ea4527169e","./adc/sbnf_chart_p1.png":"80cc554335","./adc/sbnf_chart_p2.png":"2bd4d9cf6d","./adc/sbrj_builtin_pack_v3.json":"0b93adf0d4","./adc/sbrj_builtin_pack_v4.json":"0b93adf0d4","./adc/sbrj_builtin_pack_v5.json":"0b93adf0d4","./adc/sbrj_chart_p1.png":"a4e7c7b3e3","./adc/sbrj_chart_p2.png":"6a9f372fe4","./adc/sbvt_builtin_pack_v3.json":"479e1d3842","./adc/sbvt_builtin_pack_v4.json":"479e1d3842","./adc/sbvt_builtin_pack_v5.json":"479e1d3842","./adc/sbvt_chart_p1.png":"2950b9c273","./adc/sbvt_chart_p2.png":"5672869544","./assets/icon-180.png":"a08fe77aab","./assets/icon-192.png":"7e0a669ec6","./assets/icon-32.png":"7fecc67745","./assets/icon-512.png":"b3b8909213","./assets/icon-maskable-192.png":"c5974b3ba9","./assets/icon-maskable-512.png":"eca61e4329","./assets/icon-source.png":"b3b8909213","./assets/icon.svg":"ceeaf9c37c","./assets/icons.svg":"f1eba4ae07","./cata/app.js":"09c6b106ba","./cata/index.html":"81ea0af210","./cata/styles.css":"7bf25c60bd","./index.html":"a28ecfca81","./manifest.webmanifest":"66163ef78e","./offline.html":"a403229157","./pouso-offshore/index.html":"702e3dbde3","./pouso-offshore/app.js":"914fc0f6d5","./pouso-offshore/styles.css":"4f3d2e39af","./decolagem-offshore/index.html":"227d467db3","./decolagem-offshore/app.js":"8a65828a81","./decolagem-offshore/styles.css":"4f3d2e39af","./rto/README.md":"3bebf9425d","./rto/app.js":"6409423fc0","./rto/assets/icon-180.png":"a08fe77aab","./rto/assets/icon-192.png":"7e0a669ec6","./rto/assets/icon-32.png":"7fecc67745","./rto/assets/icon-512.png":"b3b8909213","./rto/assets/icon-maskable-192.png":"c5974b3ba9","./rto/assets/icon-maskable-512.png":"eca61e4329","./rto/assets/icon-source.png":"b3b8909213","./rto/assets/icon.svg":"ceeaf9c37c","./rto/data/figure_4_54_engine_data.json":"add62c26d8","./rto/data/figure_4_54_vector_geometry.json":"58fceee453","./rto/data/figure_4_54_vector_linework.json":"7ae4a188e9","./rto/data/figure_4_56_engine_data.json":"eadc8c1e6d","./rto/data/figure_4_58_engine_data.json":"dc11f5e367","./rto/data/figure_4_68a_engine_data.json":"0a9d3ffcda","./rto/data/figure_4_92_engine_data.json":"808e8064cc","./rto/data/figure_4_94_engine_data.json":"51c587d2d4","./rto/data/figure_4_94_reference.json":"b8b0edc125","./rto/data/figure_4_96_engine_data.json":"cb88e07b3c","./rto/data/figure_4_96_reference.json":"2b3782ffa9","./rto/data/figure_4_98_engine_data.json":"08b53de4d6","./rto/data/figure_4_98_reference.json":"b40a85e800","./rto/docs/figure_4_58_center_right_corrected_reference_v17.png":"e3333beb9c","./rto/docs/figure_4_58_left_semantic_corrected_v15.png":"85aa2c303c","./rto/docs/figure_4_94_combined_fresh_v46.png":"8a06926007","./rto/docs/figure_4_94_semantic_fresh_v46.png":"c7f1981a48","./rto/docs/figure_4_94_vector_only_fresh_v46.png":"eca150637c","./rto/docs/figure_4_96_combined_fresh_v54.png":"9b8b8e0725","./rto/docs/figure_4_96_semantic_audit_sheet_v56.png":"8beb7972b9","./rto/docs/figure_4_96_semantic_fresh_v54.png":"df93a910fa","./rto/docs/figure_4_96_vector_precise_v55.png":"4b6fdd7e0c","./rto/docs/figure_4_98_center_semantic_audit_v62.png":"b4d06efa89","./rto/docs/figure_4_98_left_semantic_audit_v62.png":"b528131f9d","./rto/docs/figure_4_98_right_semantic_audit_v62.png":"be6294f676","./rto/docs/figure_4_98_semantic_audit_sheet_v62.png":"b7f6be6ee9","./rto/docs/figure_4_98_vector_exact_v62.png":"5a54209df2","./rto/docs/page_s50_108a_figure_4_68a.png":"eb6be6e6d2","./rto/docs/page_s50_85_figure_4_54.png":"74e04fe83d","./rto/docs/page_s50_89_figure_4_56.png":"659b6ce11f","./rto/docs/page_s50_93_figure_4_58.png":"ac27c6a796","./rto/docs/page_s90_123_figure_4_92.png":"605888a376","./rto/docs/page_s90_127_figure_4_94.png":"00fb96dbf2","./rto/docs/page_s90_131_figure_4_96.png":"01d0750ab4","./rto/docs/page_s90_135_figure_4_98.png":"bff0d026d7","./rto/index.html":"bb0a239415","./rto/manifest.webmanifest":"b7c9e25d7a","./rto/styles.css":"838139d262","./dropdown/graphData.js":"5ec80fc198","./shared/home.js":"3a221a12ca","./shared/module-bridge.js":"218cc0b67e","./shared/module-layout.css":"9bdd7bcfaf","./shared/omni-theme.css":"117f23b7bd","./shared/embedded-app.js":"8dbbe242b5","./shared/embedded-app.css":"b7354115e5","./shared/embedded-skin.css":"109015fdc0","./shared/landing-oei.js":"639e49377b","./cat-a/":"8b78869e38","./cat-a/index.html":"8b78869e38","./backup/":"bf754edd90","./backup/index.html":"bf754edd90","./backup/bu-data.js":"97769ab131","./backup/bu-engine.js":"639f6cd6c7","./backup/bu-ui.js":"b714f72312","./backup/charts/4C-3.webp":"a169d568b9","./backup/charts/4C-4.webp":"d5db3f4099","./backup/charts/4C-5.webp":"25b7ec50a9","./backup/charts/4C-5A.webp":"6e5a490945","./backup/charts/4C-6.webp":"c9c57c74af","./confined/":"9bd6eacfb1","./confined/index.html":"9bd6eacfb1","./confined/ca-data.js":"513c1577e6","./confined/ca-alt-data.js":"85b843ffb9","./confined/ca-after.js":"0c82897651","./confined/charts/4D-10.webp":"14259d24dc","./confined/charts/4D-11.webp":"1ce6c027c7","./confined/charts/4D-12.webp":"01c3476bfd","./confined/charts/4D-13.webp":"491d7cfb69","./confined/charts/4D-14.webp":"f3a0eb9068","./confined/charts/4D-15.webp":"1ca4996463","./confined/charts/4D-16.webp":"e10fbe1b95","./confined/charts/4D-17.webp":"14ad59078d","./confined/charts/4D-18.webp":"84eb91b10c","./confined/charts/4D-19.webp":"64e85e3e06","./confined/charts/4D-20.webp":"fc02cbe14d","./confined/charts/4D-21.webp":"a26eb85784","./confined/charts/4D-22.webp":"ceca16ccd7","./confined/charts/4D-23.webp":"302804e4a2","./confined/charts/4D-24.webp":"1f74fe877c","./confined/charts/4D-25.webp":"e8b8c02001","./confined/charts/4D-26.webp":"5c6b52939c","./confined/charts/4D-27.webp":"309da5b7f1","./confined/charts/4D-28.webp":"c20f7d1ebb","./confined/charts/4D-29.webp":"fdb5d9065f","./confined/charts/4D-30.webp":"6258a01407","./confined/charts/4D-31.webp":"9d4b65bf76","./confined/charts/4D-32.webp":"e1da117372","./confined/charts/4D-33.webp":"ce90a5e7eb","./confined/ca-engine.js":"5de4527045","./confined/charts/4D-4.webp":"c4c3228276","./confined/charts/4D-5.webp":"6c9e15fa66","./confined/charts/4D-6.webp":"7b8cdc6a6a","./confined/charts/4D-6A.webp":"88fe0088de","./confined/charts/4D-9.webp":"91aebd8472","./vertical/":"e146d58c30","./vertical/index.html":"e146d58c30","./vertical/vt-data.js":"9b24b69a9f","./vertical/vt-engine.js":"06d6333089","./vertical/vt-ui.js":"e666bee789","./vertical/charts/4A-3.webp":"65c41496fc","./vertical/charts/4A-4.webp":"6377cd735a","./vertical/charts/4A-5.webp":"06123f26bd","./vertical/charts/4A-5A.webp":"9ec5b1dfe6","./vertical/charts/4A-6.webp":"e3d9415027","./vertical/vt-p1.js":"1bb0b313c7","./vertical/vt-p2.js":"d0fcdb0430","./pouso-confined/":"3d9e281e26","./pouso-heliport/":"ba5891ea78","./pouso-heliport/index.html":"ba5891ea78","./pouso-heliport/hb-data.js":"6eaefee0bf","./pouso-heliport/hb-engine.js":"071ccaaa0f","./pouso-heliport/hb-ui.js":"73ac3796ef","./pouso-heliport/charts/4G-2.webp":"5a8f1f9efc","./pouso-confined/index.html":"3d9e281e26","./pouso-confined/cl-data.js":"9d04f2fcbd","./pouso-confined/pc-engine.js":"0178a3d411","./pouso-confined/pc-ui.js":"ee963f5531","./pouso-confined/charts/4H-4.webp":"84e34deae7","./vertical/charts/4K-5.webp":"c800090af3","./vertical/charts/4K-6.webp":"feb0d2ce0b","./vertical/charts/4K-7.webp":"53925da32c","./vertical/charts/4K-8.webp":"6a61131144","./vertical/charts/4K-9.webp":"b8fd49aa9b","./vertical/charts/4K-10.webp":"336e6bc787","./vertical/charts/4K-11.webp":"395ba20c34","./vertical/charts/4K-12.webp":"685a96c2cc","./vertical/charts/4K-13.webp":"4cb337975d","./vertical/charts/4K-14.webp":"a2b0b9f59e","./vertical/charts/4K-15.webp":"f4e80838b8","./vertical/charts/4K-16.webp":"3db84164d9","./vertical/charts/4K-17.webp":"55811049fe","./vertical/charts/4K-18.webp":"29da24b680","./vertical/charts/4K-19.webp":"21c15545e9","./vertical/charts/4K-20.webp":"c9728e025f","./vertical/charts/4K-21.webp":"f1e3b6b182","./vertical/charts/4K-22.webp":"492a570bbc","./vertical/charts/4K-23.webp":"c0aeb6b3da","./vertical/charts/4K-24.webp":"b5ee3e1307","./vertical/charts/4K-25.webp":"4fcfff391f","./vertical/charts/4K-26.webp":"c980d2d2e4","./vertical/charts/4K-27.webp":"e70cb3ddfc","./vertical/charts/4K-28.webp":"65c5a4ecf1","./vertical/charts/4A-8.webp":"2c93987671","./vertical/charts/4A-9.webp":"d23e87bb2a","./vertical/charts/4A-10.webp":"5b434fa23a","./vertical/charts/4A-11.webp":"7cde6f2522","./vertical/charts/4A-12.webp":"4e40b0a191","./vertical/charts/4A-13.webp":"f3ce2fd712","./vertical/charts/4A-14.webp":"34148b0716","./vertical/charts/4A-15.webp":"62c26a199c","./vertical/charts/4A-16.webp":"bcba86b269","./vertical/charts/4A-17.webp":"90af0238f4","./vertical/charts/4A-18.webp":"2fcb766978","./vertical/charts/4A-19.webp":"d7ad0a50dd","./vertical/charts/4A-20.webp":"a1ed5ee2a6","./vertical/charts/4A-21.webp":"ff7b328ce1","./vertical/charts/4A-22.webp":"3aa31c76ec","./vertical/charts/4A-23.webp":"2a0efe59db","./vertical/charts/4A-24.webp":"cd74ae5cb2","./vertical/charts/4A-25.webp":"21feeb455a","./vertical/charts/4A-26.webp":"7cd3fc4185","./vertical/charts/4A-27.webp":"0c0360a128","./vertical/charts/4A-28.webp":"a8fe86e4d5","./vertical/charts/4A-29.webp":"8adae6c45b","./vertical/charts/4A-30.webp":"3c474ea9e7","./vertical/charts/4A-31.webp":"35a4f85ae8","./shortfield/":"8e4e92dd41","./shortfield/index.html":"8e4e92dd41","./shortfield/sf.css":"04459c691f","./shortfield/sf-data.js":"fb066962fa","./shortfield/sf-engine.js":"a3bc76c575","./shortfield/sf-ui.js":"099d398784","./shortfield/charts/4B-1.webp":"a532c92445","./shortfield/charts/4B-2.webp":"c567c6b8ea","./shortfield/charts/4B-3.webp":"d7107f03ea","./shortfield/charts/4B-3A.webp":"ae083fb31d","./shortfield/charts/4B-4.webp":"ddfe2ed6d3","./shortfield/charts/4B-5.webp":"4cb2abead9","./shortfield/charts/4B-6.webp":"682c84713b","./shortfield/charts/4B-6A.webp":"3d9411c514","./shortfield/charts/4B-7.webp":"800bc474ce","./shared/tiles.css":"fe31691854","./catb/":"b80f9f3536","./catb/index.html":"b80f9f3536","./catb/app-data.js":"20e4b967e5","./power-check/":"d7ccb4cba1","./power-check/index.html":"d7ccb4cba1","./power-check/app-data.js":"fcbd847f38","./power-check/pwc-data.js":"42cf0aa2de","./power-check/pwc-engine.js":"9e27e482ed","./power-check/charts/NONE.webp":"3231d6a406","./power-check/charts/EAPS.webp":"c7a081c8de","./power-check/charts/IBF.webp":"f48455ee53","./ndl/":"ef0ac8ba6c","./ndl/index.html":"ef0ac8ba6c","./ndl/app-data.js":"717d2dc5fd","./roc/":"df1347dbab","./roc/index.html":"df1347dbab","./roc/app-data.js":"9c9b431fca","./consumo/":"18e311c77c","./consumo/index.html":"18e311c77c","./consumo/app-data.js":"2d5ef998f6","./teto-pairado/":"ffbb7c4864","./teto-pairado/index.html":"ffbb7c4864","./teto-pairado/app-data.js":"caa6028e0b","./teto-pairado/hl-data.js":"a07a77d29f","./teto-pairado/hl-engine.js":"db9c774340","./teto-pairado/hl-ui.js":"70a7069cd5","./teto-pairado/charts/4-43.webp":"ea64bf3937","./teto-pairado/charts/S50-4-37.webp":"8504726fb9","./limitacoes/":"19e32631bf","./limitacoes/index.html":"19e32631bf","./limitacoes/app-data.js":"eee931d32f","./shared/offshore-calc.js":"d1f822971c","./shared/pwa.css":"0b2b41c17f","./shared/pwa.js":"18d5fe2a9a","./styles.css":"d6df5af781","./wat/README.md":"06da1901f0","./wat/app.js":"1405ffb022","./wat/assets/icon-180.png":"a08fe77aab","./wat/assets/icon-192.png":"7e0a669ec6","./wat/assets/icon-32.png":"7fecc67745","./wat/assets/icon-512.png":"b3b8909213","./wat/assets/icon-maskable-192.png":"c5974b3ba9","./wat/assets/icon-maskable-512.png":"eca61e4329","./wat/assets/icon-source.png":"b3b8909213","./wat/assets/icon.svg":"ceeaf9c37c","./wat/assets/offshore_standard_chart_clip.png":"78214165ed","./wat/data/chart-schema.json":"e84976cdb5","./wat/data/clear-eapsoff-exact.json":"4443b57283","./wat/data/clear-eapson-exact.json":"102cbc91be","./wat/data/clear-standard-exact.json":"8146090402","./wat/data/confined-eapsoff-6400-exact.json":"6ed2281668","./wat/data/confined-eapsoff-exact.json":"75a2719e94","./wat/data/confined-eapson-6400-exact.json":"3e4342c78f","./wat/data/confined-eapson-exact.json":"4ca834c44c","./wat/data/confined-ibf-6400-exact.json":"489ba48cfa","./wat/data/confined-standard-6400-exact.json":"5d0899d9a7","./wat/data/confined-standard-exact.json":"ad0c801588","./wat/data/eaps-off-exact.json":"e08569afca","./wat/data/ibf-cleararea-exact.json":"2b506321d5","./wat/data/ibf-confined-exact.json":"4fd78b4006","./wat/data/ibf-installed-exact.json":"d87f7ef440","./wat/data/sup90-clear-eapsoff-exact.json":"1ad9d32f9b","./wat/data/sup90-clear-eapson-exact.json":"b5732d4a66","./wat/data/sup90-clear-ibf-exact.json":"19eb4567b4","./wat/data/sup90-clear-standard-exact.json":"39d3f1b925","./wat/data/sup90-cleararea-stageA.json":"70d5f4e5bf","./wat/data/sup90-cleararea-stageB.json":"0af48578e9","./wat/docs/Confined 6400 charts.pdf":"64e0911dda","./wat/docs/WAC charts 6800.pdf":"863c46943c","./wat/docs/WAT enhanced.pdf":"3365c19d09","./wat/docs/page-01.png":"98dcb1e36e","./wat/docs/page-02.png":"cf2b60e02b","./wat/docs/page-03.png":"779a3cbb79","./wat/docs/page-04.png":"9c69ec6824","./wat/docs/page-05.png":"338269411c","./wat/docs/page-06.png":"b7c46ebafd","./wat/docs/page-07.png":"93b1aedb74","./wat/docs/page-08.png":"dc09690af9","./wat/docs/page-09.png":"2d444748a5","./wat/docs/page-10.png":"d0da82e194","./wat/docs/page-11.png":"b2bd181248","./wat/docs/page-12.png":"83bd327295","./wat/docs/page-13.png":"37c301bd9f","./wat/docs/page-14.png":"3910cc7596","./wat/docs/page-15.png":"e73c0f87a3","./wat/docs/page-16.png":"115f8033ee","./wat/docs/page-17.png":"f350827d1f","./wat/docs/page-18.png":"1980ca6cad","./wat/docs/page-19.png":"14677f00da","./wat/docs/page-20.png":"98fe336fb1","./wat/docs/page-21.png":"e8ad896654","./wat/docs/page-22.png":"77b108f6ee","./wat/docs/page-23.png":"96ee258424","./wat/docs/page-24.png":"a2e1afa641","./wat/docs/page-25.png":"8ca695e708","./wat/docs/page-26.png":"16291f06d5","./wat/docs/page-27.png":"f6ca30c83b","./wat/docs/page-28.png":"834d710b44","./wat/docs/page-29.png":"8441208079","./wat/docs/page-30.png":"329425d392","./wat/docs/page-31.png":"3fbdf34873","./wat/docs/page-32.png":"0da936d818","./wat/docs/page-33.png":"69e8f596d2","./wat/docs/wat7000.pdf":"7b4d5b7a7f","./wat/index.html":"f4e5ad2e9b","./wat/manifest.webmanifest":"a4ffcf1781","./wat/styles.css":"67172edf8b","./wat/test_overlay_case.png":"c9176ae09a"};

// Arquivos sem os quais o app não abre: se um deles falhar, a instalação falha e a versão anterior continua.
const CORE = /(\/|\.(html|js|css|json|svg|webmanifest))$/i;

// Progresso do download offline, mostrado na tela inicial (shared/offline-status.js).
const progress = { state: 'idle', done: 0, failed: 0, total: 0 };
const precacheUrls = () => [...new Set(PRECACHE)];
async function broadcast() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  const msg = Object.assign({ type: 'offline-status', version: CACHE_NAME }, progress);
  clients.forEach((c) => c.postMessage(msg));
}
let lastBroadcast = 0;
function tick(force) {
  const now = Date.now();
  if (force || now - lastBroadcast > 150) { lastBroadcast = now; broadcast(); }
}
// Baixa a lista (ou só o que falta) para o cache desta versão, contando o progresso.
async function fill(urls) {
  const cache = await caches.open(CACHE_NAME);
  progress.state = 'downloading'; progress.total = precacheUrls().length;
  progress.done = progress.total - urls.length; progress.failed = 0; tick(true);
  const results = await Promise.allSettled(urls.map(async (url) => {
    try {
      // cache:'reload' ignora o cache HTTP do navegador, para não gravar cópias antigas na versão nova.
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (!response.ok) throw new Error(url + ' ' + response.status);
      await cache.put(url, response);
      progress.done++;
    } catch (e) { progress.failed++; throw e; } finally { tick(); }
  }));
  progress.state = progress.failed ? 'partial' : 'ready'; tick(true);
  return results;
}
async function status() {
  if (progress.state === 'downloading') return;
  const cache = await caches.open(CACHE_NAME);
  const have = new Set((await cache.keys()).map((r) => r.url));
  const urls = precacheUrls();
  const missing = urls.filter((u) => !have.has(new URL(u, self.registration.scope).href));
  progress.total = urls.length; progress.done = urls.length - missing.length; progress.failed = missing.length;
  progress.state = missing.length ? 'partial' : 'ready';
  return missing;
}

// Copia do cache da versão anterior os arquivos que não mudaram (mesmo hash em HASHES) e devolve o que falta baixar.
const HASH_KEY = './__hashes__.json';
async function reuse(urls) {
  const cache = await caches.open(CACHE_NAME);
  const names = (await caches.keys()).filter((k) => k.startsWith('aw139-'));
  const left = new Set(urls);
  for (const name of [CACHE_NAME, ...names.filter((k) => k !== CACHE_NAME)]) {
    if (!left.size) break;
    const old = await caches.open(name);
    let oldHashes = null;
    try { const r = await old.match(HASH_KEY); if (r) oldHashes = await r.json(); } catch (_) {}
    if (!oldHashes) continue;
    for (const url of [...left]) {
      if (!HASHES[url] || oldHashes[url] !== HASHES[url]) continue;
      const hit = await old.match(url);
      if (!hit) continue;
      if (name !== CACHE_NAME) await cache.put(url, hit);
      left.delete(url);
    }
  }
  return urls.filter((u) => left.has(u));
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const urls = await reuse(precacheUrls());
    const results = await fill(urls);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(HASH_KEY, new Response(JSON.stringify(HASHES), { headers: { 'Content-Type': 'application/json' } }));
    // Imagens e PDFs que falharem são baixados depois (botão na tela inicial ou no primeiro uso com internet).
    const coreFailed = results.some((r, i) => r.status === 'rejected' && CORE.test(urls[i]));
    if (coreFailed) throw new Error('Falha ao baixar arquivos essenciais do app');
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Apaga só versões antigas deste site (inclusive os caches dos antigos service workers de /wat/ e /rto/).
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k.startsWith('aw139-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  if (type === 'OFFLINE_STATUS') event.waitUntil(status().then(() => broadcast()));
  if (type === 'OFFLINE_FILL') event.waitUntil(status().then((missing) => missing && missing.length ? fill(missing) : broadcast()));
});

// HTML, JS, CSS, JSON e SVG: rede primeiro (com limite de tempo) e cache como reserva offline.
// Imagens e PDFs pesados: cache primeiro.
const NETWORK_FIRST = /\.(html|js|css|json|svg|webmanifest)$/i;
const NETWORK_TIMEOUT_MS = 3500;

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
}

async function networkFirst(request) {
  // Pela URL: um Request de navegação não aceita opções extras.
  const network = fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' }).then((fresh) => {
    if (fresh.ok) putInCache(request, fresh.clone());
    return fresh;
  });
  network.catch(() => {});
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, null));
  let fresh = null;
  try {
    fresh = await Promise.race([network, timeout]);
    if (fresh && fresh.ok) return fresh;
  } catch (_) {}
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    return fresh || await network;
  } catch (error) {
    if (request.mode === 'navigate') {
      const offline = await caches.match('./offline.html', { ignoreSearch: true });
      if (offline) return offline;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const fresh = await fetch(request);
  putInCache(request, fresh.clone());
  return fresh;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const isNetworkFirst = request.mode === 'navigate' || url.pathname.endsWith('/') || NETWORK_FIRST.test(url.pathname);
  event.respondWith(isNetworkFirst ? networkFirst(request) : cacheFirst(request));
});
