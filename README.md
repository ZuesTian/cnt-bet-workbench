# CNT-BET GitHub Pages

Public prediction UI: <https://zuestian.github.io/cnt-bet-workbench/>.

The browser calls `https://47.236.76.214.nip.io` for quick estimation, BET prediction,
explanation, inverse design, and MWCNT powder-resistivity prediction. The public API does
not expose batch upload, batch prediction, or result-file download. Outputs are for research
screening and are not release specifications.

`nip.io` is a free temporary hostname. Replace `window.CNTBET_API_BASE` in `index.html` with
an owned HTTPS domain before treating the service as a long-term production endpoint.
