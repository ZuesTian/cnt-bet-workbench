# CNT-BET GitHub Pages

Public prediction UI: <https://zuestian.github.io/cnt-bet-workbench/>.

The same static workbench is published to GitHub Pages and mirrored by the Aliyun server.
GitHub Pages calls `https://47.236.76.214.nip.io`; the Aliyun mirror uses same-origin API
requests. Public features include quick estimation, BET prediction, explanation, what-if,
powder-resistivity prediction, limited batch prediction, and inverse design.

Batch files are limited to 1 MB and 200 rows. The server returns an in-memory workbook and
does not persist public reports or expose server paths. Outputs are for research screening
and are not release specifications.

`nip.io` is a free temporary hostname. Replace the GitHub-host API target in `js/api.js` with
an owned HTTPS domain before treating the service as a long-term production endpoint.
