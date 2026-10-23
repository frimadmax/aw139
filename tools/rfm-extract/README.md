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
