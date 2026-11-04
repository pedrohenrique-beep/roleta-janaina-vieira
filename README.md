# Roleta Janaina Vieira

Roleta premiada da Janaina Vieira (Betim, MG) para captação de leads via tráfego pago, stories e base de clientes.

## Onde alterar

- **Textos e prêmios exibidos**: array `PRIZES` em `index.html`.
- **Chances de cada prêmio**: array `PREMIOS` em `apps-script/Code.gs` (o sorteio acontece no servidor).
- **Giro do calçado**: `CALCADO_DE` e `CALCADO_ATE` em `Code.gs` (hoje entre o 150º e o 170º giro, sorteado uma vez e guardado em segredo).
- **Configuração** (topo do `<script>` do `index.html`): `SHEETS_URL`, `WHATSAPP_LOJA`, `PIXEL_ID`, `FIM_CAMPANHA`.
- **Cores e fontes**: bloco `:root` no `<style>`.

## Chances atuais

| Prêmio | Chance |
|---|---|
| 5% OFF | 30% |
| Copo térmico personalizado (compras acima de R$200,00) | 22% |
| 10% OFF | 14% |
| R$50 OFF (acima de R$599,00) | 14% |
| Chinelo Colcci (acima de R$499,00) | 12% |
| R$100 OFF (acima de R$899,00) | 8% |
| Calçado Janaina Vieira | 1 unidade, num giro entre o 150º e o 170º |

## Pendente

- [x] URL `/exec` do Apps Script em `SHEETS_URL`
- [ ] WhatsApp da loja em `WHATSAPP_LOJA`
- [ ] Pixel da Meta em `PIXEL_ID` (opcional)
- [ ] Endereço completo no rodapé

## Planilha

`apps-script/Code.gs`: sorteia o prêmio, gera o código `JV-XXXX`, bloqueia WhatsApp repetido e grava na aba **Leads** com o nº do giro. A linha do calçado fica destacada em dourado.

Funções úteis no editor do Apps Script:
- `verCalcado()`: mostra em qual giro o calçado vai sair e se já saiu.
- `zerarCalcado()`: zera o controle (use só depois de apagar as linhas de teste).

## Links por origem

`?origem=trafego` · `?origem=stories` · `?origem=bio` · `?origem=clientes` · `?origem=loja`

## Deploy

Projeto estático. Na Vercel: Add New → Project → importar este repositório → Deploy (sem build).
