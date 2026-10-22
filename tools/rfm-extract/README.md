# Extração vetorial das cartas do RFM

Scripts usados para gerar `shortfield/sf-data.js` e as imagens `shortfield/charts/*.webp`
a partir do PDF "AW 139 RFM REV 30.pdf" (pymupdf + Pillow).

Ordem: `ex_wat.py` → `ex_rto.py` → `ex_cto.py` (geram wat/rto/cto.json) → `build.py`.
`overlay.py` desenha as curvas extraídas sobre a página para conferência visual.
Curvas Bézier são amostradas e simplificadas (RDP, 0,03 pt). Calibração dos eixos pelos
rótulos ajustados às linhas de grade.
