# Extração vetorial das cartas do RFM

Scripts usados para gerar `shortfield/sf-data.js` e as imagens `shortfield/charts/*.webp`
a partir do PDF "AW 139 RFM REV 30.pdf" (pymupdf + Pillow).

Ordem: `ex_wat.py` → `ex_rto.py` → `ex_cto.py` (geram wat/rto/cto.json) → `build.py`.
`overlay.py` desenha as curvas extraídas sobre a página para conferência visual.
Curvas Bézier são amostradas e simplificadas (RDP, 0,03 pt). Calibração dos eixos pelos
rótulos ajustados às linhas de grade.

Vertical (Parte A): `ex_vt.py` (W.A.T. 4A-3 a 4A-5A e CTO 4A-6) e `build.py ../../vertical VT_CHARTS vt_wat.json,vt_cto.json vt-data.js`.

Back Up (Parte C): `ex_bu.py bu` (W.A.T. 4C-3 a 4C-5A, calibração automática por `auto.py`),
`ex_cto.py bu` (Fig. 4C-6) e `build.py ../../backup BU_CHARTS bu_wat.json,bu_cto.json bu-data.js`.

PATH 1 do Vertical (Fig. 4A-8 a 4A-31): `mk915.py` (gera `p915_6400.pdf`; no PDF Rev 30 a página da Fig. 4A-13
tem uma cópia da carta de 6000 kg desenhada por cima da carta correta de 6400 kg), `ex_p1.py` → `vt_p1.json`,
`build.py ../../vertical VT_P1 vt_p1.json vt-p1.js`. `ov_p1.py 4A-8,...` desenha a extração para conferência.
PATH 2 (Parte K, Fig. 4K-5 a 4K-28): `ex_p1.py p2` → `k_p2.json`, `build.py ../../vertical VT_P2 k_p2.json vt-p2.js`.
O eixo do gradiente é calibrado pela moldura do painel (os rótulos do PDF ficam ~1,3 pt deslocados).

Power Check (Supl. 12 Fig. 4K-2/4K-3, Supl. 86 Fig. 4-1A, NR 102%): `ex_pwc.py` → `pwc.json` (gera `pwc_<pág>.pdf` sem o exemplo
tracejado vermelho), `build.py ../../power-check PWC_CHARTS pwc.json pwc-data.js`. `ov_pwc.py <dir>` desenha a extração.

Pouso Heliport (Parte G, Fig. 4G-2 Balked Landing Distance): `ex_hb.py` → `hb.json`, `build.py ../../pouso-heliport HB_CHARTS hb.json hb-data.js`.

Pouso Clear Area OEI (Supl. 12 Parte J Fig. 4J-2/1, 4J-2/2, 4J-1; Supl. 50 Fig. 4-60/61/62; Supl. 90 Fig. 4-100/101/102):
`ex_cl.py` → `cl_ldg.json`, `build.py ../../cata CL_LDG cl_ldg.json cl-data.js`. `ov_cl.py <dir> <figs>` desenha a extração, `rd_cl.py` testa a leitura.
Na 4J-2/2 as linhas de OAT são polígonos preenchidos, a linha de 50 °C é o próprio MAX OAT e a 1ª curva de peso (sem rótulo) é 4400 kg.
Na 4-100 os rótulos de peso são ambíguos; a curva de 6800 kg foi conferida contra a 6800 da Fig. 4-60.

Pouso Offshore, Balked Landing Distance OEI (Supl. 12 Parte I Fig. 4I-2/4/6/8; Supl. 50 Fig. 4-75/77/79/100):
`ex_obl.py` → `obl.json`, `build.py ../../pouso-offshore OBL_CHARTS obl.json obl-data.js`. `ov_obl.py <dir> <figs>` desenha a extração.
As curvas vêm em pedaços sobrepostos e recortados (clip) pelo painel: o extrator aplica o clip de cada caminho, filtra pela página
renderizada (só o que aparece escuro) e junta os pedaços. Na 4-100 há uma carta antiga escondida por baixo; a moldura e os eixos
são medidos na grade visível (-40..50 °C; 0..600 m).

CAT B (Seção 4 Fig. 4-17/4-18; Supl. 50 Fig. 4-35/4-36; Supl. 90 Fig. 4-42/4-43): `ex_cb.py` → `cb.json`,
`build.py ../../catb CB_CHARTS cb.json cb-data.js`. `ov_cb.py <dir> <figs>` desenha a extração.
Na Seção 4 as linhas de OAT são traços grossos contornados (polígonos): usa a linha média das bordas; 50 e -40 °C são as
linhas vermelhas do envelope. Pedaços de curva são agrupados só quando se sobrepõem na mesma direção e encadeados pela ponta.
A ordem das curvas de peso vem do sentido dos rótulos; conferido cruzando cartas (6400 kg Seção 4 x Supl. 50 e 6800 kg
Supl. 50 x Supl. 90 batem em até 0,3 m).
