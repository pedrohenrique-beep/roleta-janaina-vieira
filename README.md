# Roleta Janaina Vieira

Roleta premiada da Janaina Vieira (Betim, MG) para captação de leads via tráfego pago, stories e base de clientes.

## Onde alterar

- **Textos e prêmios exibidos**: array `PRIZES` em `index.html`.
- **Chances de cada prêmio**: array `PREMIOS` em `apps-script/Code.gs` (o sorteio acontece no servidor).
- **Copos**: `COPO_A_CADA` e `COPO_ESTOQUE` em `Code.gs`.
- **Configuração** (topo do `<script>` do `index.html`): `SHEETS_URL`, `WHATSAPP_LOJA`, `PIXEL_ID`, `FIM_CAMPANHA`.
- **Cores e fontes**: bloco `:root` no `<style>`.

## Chances atuais

| Prêmio | Chance |
|---|---|
| 10% OFF | 30% |
| Chinelo Lança Perfume (acima de R$499,00) | 20% |
| R$50 OFF (acima de R$599,00) | 20% |
| R$100 OFF (acima de R$899,00) | 20% |
| Frete grátis para compras acima de R$799,90 (apenas em MG) | 10% |
| Copo térmico Janaina Vieira (acima de R$200,00) | 1 a cada 20 giros (giro sorteado dentro do bloco), até 8 copos |

## Pendente

- [x] URL `/exec` do Apps Script em `SHEETS_URL`
- [x] WhatsApp da loja em `WHATSAPP_LOJA`
- [x] Pixel da Meta em `PIXEL_ID` (2254123642169613)
- [ ] Endereço completo no rodapé

## Planilha

`apps-script/Code.gs`: sorteia o prêmio, gera o código `JV-XXXX`, bloqueia WhatsApp repetido e grava na aba **Leads** com o nº do giro. A linha de quem ganha o copo fica com fundo bege.

Funções úteis no editor do Apps Script:
- `verCalcado()`: mostra quantos copos já saíram e quantos giros houve.
- `zerarCalcado()`: zera a contagem dos copos (use só depois de apagar as linhas de teste).

## Links por origem

`?origem=trafego` · `?origem=stories` · `?origem=bio` · `?origem=clientes` · `?origem=loja`

## Deploy

Projeto estático. Na Vercel: Add New → Project → importar este repositório → Deploy (sem build).
