/**
 * Roleta Janaina Vieira: sorteia o prêmio, grava o giro na planilha e libera o calçado.
 * Cole este código em Extensões → Apps Script da planilha de leads
 * e implante como App da Web (Executar como: Eu · Acesso: Qualquer pessoa).
 *
 * O sorteio acontece AQUI (servidor), não no navegador: ninguém consegue forçar o prêmio.
 *
 * CALÇADO (prêmio raro): sai uma única vez, num giro sorteado entre CALCADO_DE e CALCADO_ATE.
 * O número exato fica guardado em Propriedades do script → CALCADO_GIRO (só você vê).
 * Assim ninguém consegue "esperar o giro 150" para ganhar.
 *
 * Meta (opcional): em Configurações do projeto → Propriedades do script:
 *   META_PIXEL_ID, META_TOKEN, META_TEST_CODE (só durante testes)
 */

const ABA = 'Leads';
const CABECALHO = ['Data', 'Giro nº', 'Nome', 'WhatsApp', 'Prêmio', 'Código', 'Origem', 'Status do resgate', 'Valor da compra', 'Observações'];
const FIM_CAMPANHA = new Date('2026-11-30T23:59:59-03:00');

// Faixa do giro que ganha o calçado
const CALCADO_DE = 150;
const CALCADO_ATE = 170;

// Prêmios e chances (peso em %). Os "id" precisam ser iguais aos do index.html.
const PREMIOS = [
  { id: 'off5',    nome: '5% OFF na sua compra',                          peso: 30 },
  { id: 'copo',    nome: 'Copo térmico personalizado (compras +R$200)',   peso: 22 },
  { id: 'off10',   nome: '10% OFF na sua compra',                         peso: 14 },
  { id: 'r50',     nome: 'R$50 OFF (compras a partir de R$599)',          peso: 14 },
  { id: 'chinelo', nome: 'Chinelo Colcci (compras a partir de R$499)',    peso: 12 },
  { id: 'r100',    nome: 'R$100 OFF (compras a partir de R$899)',         peso: 8 }
];
const CALCADO = { id: 'calcado', nome: 'CALÇADO JANAINA VIEIRA (prêmio raro)' };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (Date.now() > FIM_CAMPANHA.getTime()) return resposta({ ok: false, erro: 'encerrada' });

    const dados = JSON.parse(e.postData.contents);
    const whatsapp = String(dados.whatsapp || '').replace(/\D/g, '');
    if (!dados.nome || whatsapp.length < 12) return resposta({ ok: false, erro: 'dados_invalidos' });

    const aba = obterAba();
    const jaGirou = aba.getRange('D:D').createTextFinder(whatsapp).matchEntireCell(true).findNext();
    if (jaGirou) return resposta({ ok: false, erro: 'ja_girou' });

    const giro = aba.getLastRow(); // linha 1 = cabeçalho, então o próximo giro = lastRow
    const premio = sortear(giro);
    const codigo = gerarCodigo(aba);

    aba.appendRow([
      new Date(), giro, String(dados.nome).slice(0, 80), whatsapp,
      premio.nome, codigo, String(dados.origem || 'direto').slice(0, 40),
      'Pendente', '', ''
    ]);
    if (premio.id === CALCADO.id) {
      aba.getRange(aba.getLastRow(), 1, 1, CABECALHO.length).setBackground('#F6E3B8').setFontWeight('bold');
      PropertiesService.getScriptProperties().setProperty('CALCADO_SAIU', String(giro));
    }

    try { enviarLeadMeta(dados, whatsapp, premio.nome, codigo); } catch (errMeta) { console.error('Meta CAPI', errMeta); }
    return resposta({ ok: true, premio: premio.id, codigo: codigo, giro: giro });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, erro: 'falha_servidor' });
  } finally {
    lock.releaseLock();
  }
}

function sortear(giro) {
  const props = PropertiesService.getScriptProperties();
  let alvo = Number(props.getProperty('CALCADO_GIRO'));
  if (!alvo) {
    alvo = CALCADO_DE + Math.floor(Math.random() * (CALCADO_ATE - CALCADO_DE + 1));
    props.setProperty('CALCADO_GIRO', String(alvo));
  }
  // giro >= alvo: se por algum motivo o giro exato falhar, o próximo leva.
  if (!props.getProperty('CALCADO_SAIU') && giro >= alvo) return CALCADO;

  const total = PREMIOS.reduce(function (s, p) { return s + p.peso; }, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PREMIOS.length; i++) { r -= PREMIOS[i].peso; if (r < 0) return PREMIOS[i]; }
  return PREMIOS[0];
}

function gerarCodigo(aba) {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let t = 0; t < 10; t++) {
    let c = 'JV-';
    for (let i = 0; i < 4; i++) c += letras.charAt(Math.floor(Math.random() * letras.length));
    if (!aba.getRange('F:F').createTextFinder(c).matchEntireCell(true).findNext()) return c;
  }
  return 'JV-' + Date.now().toString(36).toUpperCase().slice(-5);
}

function doGet() {
  return resposta({ ok: true, status: 'Roleta Janaina Vieira ativa' });
}

function obterAba() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA);
  if (!aba) { aba = planilha.getSheets()[0]; aba.setName(ABA); }
  if (aba.getLastRow() === 0) {
    aba.appendRow(CABECALHO);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight('bold');
    aba.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    aba.getRange('D:D').setNumberFormat('@');
    aba.getRange('I:I').setNumberFormat('"R$" #,##0.00');
    const regra = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pendente', 'Contatado', 'Comprou', 'Sem resposta', 'Não usou'], true)
      .build();
    aba.getRange('H2:H').setDataValidation(regra);
  }
  return aba;
}

// Para conferir (rode no editor): mostra em qual giro o calçado vai sair e se já saiu.
function verCalcado() {
  const p = PropertiesService.getScriptProperties();
  console.log('Calçado programado para o giro: ' + (p.getProperty('CALCADO_GIRO') || 'ainda não definido (define no 1º giro)'));
  console.log('Já saiu no giro: ' + (p.getProperty('CALCADO_SAIU') || 'não'));
  console.log('Giros até agora: ' + Math.max(0, obterAba().getLastRow() - 1));
}

// Use SÓ depois de apagar as linhas de teste: zera o controle do calçado.
function zerarCalcado() {
  const p = PropertiesService.getScriptProperties();
  p.deleteProperty('CALCADO_GIRO');
  p.deleteProperty('CALCADO_SAIU');
  console.log('Controle do calçado zerado. O giro premiado será sorteado de novo.');
}

// ---------- Meta: API de Conversões ----------
function enviarLeadMeta(dados, whatsapp, premio, codigo) {
  const props = PropertiesService.getScriptProperties();
  const pixel = props.getProperty('META_PIXEL_ID');
  const token = props.getProperty('META_TOKEN');
  if (!pixel || !token) return;

  const primeiroNome = String(dados.nome || '').trim().split(/\s+/)[0].toLowerCase();
  const userData = { ph: [sha256(whatsapp)], external_id: [sha256(whatsapp)], country: [sha256('br')] };
  if (primeiroNome) userData.fn = [sha256(primeiroNome)];
  if (dados.fbp) userData.fbp = String(dados.fbp);
  if (dados.fbc) userData.fbc = String(dados.fbc);
  if (dados.ua) userData.client_user_agent = String(dados.ua).slice(0, 400);

  const corpo = { data: [{
    event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: codigo,
    action_source: 'website', event_source_url: String(dados.url || ''),
    user_data: userData, custom_data: { content_name: premio, origem: dados.origem || 'direto' }
  }] };
  const teste = props.getProperty('META_TEST_CODE');
  if (teste) corpo.test_event_code = teste;

  const r = UrlFetchApp.fetch('https://graph.facebook.com/v23.0/' + pixel + '/events?access_token=' + encodeURIComponent(token), {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(corpo), muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) console.error('Meta CAPI ' + r.getResponseCode() + ': ' + r.getContentText());
}

function sha256(texto) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(texto), Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
