// ---- O que muda de um comércio para outro fica aqui em cima ----

// WhatsApp do comércio: só dígitos, com 55 + DDD. Vazio = o WhatsApp abre para escolher o contato.
const WHATSAPP = '';

// Horas das fornadas (11.5 = 11h30). Domingo a padaria fecha ao meio-dia.
const FORNADAS = [6, 9, 11.5, 15, 17.5];
const FECHA = { 0: 12, 6: 19, padrao: 20 };
const ABRE = 6;

// Entrega: bairros atendidos e a taxa de cada um
const BAIRROS = [
  { nome: 'Centro', taxa: 5 },
  { nome: 'Jardim Glória', taxa: 6 },
  { nome: 'Patrimônio de São João Batista', taxa: 6 },
  { nome: 'São José', taxa: 7 },
  { nome: 'Santa Efigênia', taxa: 7 },
  { nome: 'Jardim dos Laranjais', taxa: 8 },
  { nome: 'Vila Rizzati', taxa: 8 },
  { nome: 'Jardim Menina Moça', taxa: 9 },
  { nome: 'Cohab', taxa: 9 },
];

const CARDAPIO = [
  { nome: 'Pães', itens: [
    { nome: 'Pão francês, saco com 10', preco: 9.5, desc: 'Casca fina e crocante. Sai quente cinco vezes por dia.' },
    { nome: 'Pão de fermentação natural', preco: 22, desc: 'Casca grossa, miolo aerado. De quinta a sábado.' },
    { nome: 'Pão de queijo', preco: 4.5, desc: 'Com queijo meia-cura, assado na hora.' },
    { nome: 'Pão de leite, pacote com 6', preco: 8.5, desc: 'Macio, bom para o lanche das crianças.' },
    { nome: 'Pão doce de coco', preco: 7, desc: 'Massa fofinha com coco queimado por cima.' },
  ] },
  { nome: 'Bolos e doces', foto: 'bolos.jpg', alt: 'Bolo de fubá e bolo de cenoura com chocolate no balcão', itens: [
    { nome: 'Bolo de fubá, inteiro', preco: 28, desc: 'O da casa, com erva-doce. Costuma acabar antes das dez.' },
    { nome: 'Bolo de cenoura, fatia', preco: 8, desc: 'Com bastante cobertura de chocolate.' },
    { nome: 'Sonho de creme', preco: 6.5, desc: 'Recheado na hora, com açúcar por cima.' },
    { nome: 'Torta de limão, fatia', preco: 12, desc: 'Merengue maçaricado.' },
  ] },
  { nome: 'Salgados', foto: 'salgados.jpg', alt: 'Coxinhas, esfihas e enroladinhos na estufa', itens: [
    { nome: 'Coxinha', preco: 7.5, desc: 'Massa de batata, frango desfiado com requeijão.' },
    { nome: 'Esfiha de carne', preco: 6, desc: 'Aberta, temperada com limão.' },
    { nome: 'Enroladinho de salsicha', preco: 5.5, desc: 'Assado, com orégano.' },
    { nome: 'Risoles de presunto e queijo', preco: 7, desc: 'Frito na hora do pedido.' },
  ] },
  { nome: 'Café da manhã', foto: 'cafe.jpg', alt: 'Pão na chapa com manteiga e pingado no copo americano', itens: [
    { nome: 'Café coado', preco: 5, desc: 'Passado na hora, grão da região.' },
    { nome: 'Pingado', preco: 6, desc: 'No copo americano, como tem que ser.' },
    { nome: 'Pão na chapa', preco: 6.5, desc: 'Pão francês, manteiga e chapa quente.' },
    { nome: 'Misto quente', preco: 11, desc: 'Presunto e queijo no pão francês.' },
    { nome: 'Suco de laranja, 400 ml', preco: 9, desc: 'Espremido na hora.' },
  ] },
];

// ---- Daqui para baixo é o funcionamento do site ----

const reais = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hora = h => `${Math.floor(h)}h${h % 1 ? '30' : ''}`;

function linkWhats(texto) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

function agoraEmBrasilia() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return { dia: d.getDay(), horas: d.getHours() + d.getMinutes() / 60 };
}

function horarios() {
  const { dia, horas } = agoraEmBrasilia();
  const fecha = FECHA[dia] ?? FECHA.padrao;
  const aberto = horas >= ABRE && horas < fecha;

  const status = document.getElementById('status-aberto');
  status.textContent = aberto ? `Aberto agora · fecha às ${hora(fecha)}` : `Fechado agora · abre às ${hora(ABRE)}`;
  status.classList.toggle('fechado', !aberto);

  document.querySelectorAll('.horarios tr').forEach(tr => {
    tr.classList.toggle('hoje', tr.dataset.dias.split(',').includes(String(dia)));
  });

  const deHoje = FORNADAS.filter(f => f < fecha);
  const proxima = deHoje.find(f => f > horas);
  document.getElementById('fornadas').innerHTML = deHoje.map(f => {
    const classe = f === proxima ? 'proxima' : f <= horas ? 'saiu' : '';
    const obs = f === proxima ? 'próxima' : f <= horas ? 'saiu' : '';
    return `<li class="${classe}"><span>${hora(f)}</span><span>${obs}</span></li>`;
  }).join('');

  const aviso = document.getElementById('proxima-fornada');
  if (proxima === undefined) {
    aviso.textContent = `Por hoje é só. Amanhã tem às ${hora(FORNADAS[0])}.`;
  } else {
    const min = Math.round((proxima - horas) * 60);
    aviso.textContent = min >= 60
      ? `Pão quente em ${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}.`
      : `Pão quente em ${min} min.`;
  }
}

const pedido = new Map(); // nome do item -> quantidade
const precoDe = new Map(CARDAPIO.flatMap(c => c.itens.map(i => [i.nome, i.preco])));

function montarCardapio() {
  document.getElementById('cardapio-lista').innerHTML = CARDAPIO.map((cat, n) => `
    <section class="categoria">
      ${cat.foto ? `<img src="img/${cat.foto}" alt="${cat.alt}" width="1280" height="720" loading="lazy">` : ''}
      <h3><small>${String(n + 1).padStart(2, '0')}</small>${cat.nome}</h3>
      <ul class="itens">
        ${cat.itens.map(i => `
        <li class="item" data-item="${i.nome}">
          <div class="item-linha"><span class="item-nome">${i.nome}</span><i></i><span class="item-preco">${reais(i.preco)}</span></div>
          <p class="item-desc">${i.desc}</p>
          <div class="qtd">
            <button type="button" class="menos" aria-label="Tirar um ${i.nome}">&minus;</button>
            <output>0</output>
            <button type="button" class="mais" aria-label="Adicionar ${i.nome}">+</button>
          </div>
        </li>`).join('')}
      </ul>
    </section>`).join('');

  document.getElementById('cardapio-lista').addEventListener('click', e => {
    const botao = e.target.closest('.qtd button');
    if (!botao) return;
    const li = botao.closest('.item');
    const nome = li.dataset.item;
    const qtd = Math.max(0, (pedido.get(nome) || 0) + (botao.classList.contains('mais') ? 1 : -1));
    qtd ? pedido.set(nome, qtd) : pedido.delete(nome);
    atualizarItem(li, qtd);
    atualizarBarra();
  });
}

function atualizarItem(li, qtd) {
  li.classList.toggle('escolhido', qtd > 0);
  li.querySelector('.qtd').classList.toggle('tem', qtd > 0);
  li.querySelector('output').textContent = qtd;
}

function atualizarBarra() {
  const barra = document.getElementById('pedido-barra');
  const itens = [...pedido];
  const qtd = itens.reduce((s, [, q]) => s + q, 0);
  const total = itens.reduce((s, [nome, q]) => s + q * precoDe.get(nome), 0);
  barra.hidden = qtd === 0;
  if (!qtd) return;
  document.getElementById('pedido-qtd').textContent = qtd === 1 ? '1 item' : `${qtd} itens`;
  document.getElementById('pedido-total').textContent = `· ${reais(total)}`;
}

function limparPedido() {
  pedido.clear();
  document.querySelectorAll('.item.escolhido').forEach(li => atualizarItem(li, 0));
  atualizarBarra();
}
document.getElementById('pedido-limpar').addEventListener('click', limparPedido);

document.querySelectorAll('[data-whats]').forEach(a => {
  a.href = linkWhats(a.dataset.whats);
  a.target = '_blank';
  a.rel = 'noopener';
});

montarCardapio();
horarios();
setInterval(horarios, 60000);

// ---- Fechar pedido: dados, pagamento e confirmação ----
// O pagamento aqui é simulado (protótipo). Num site real, os pontos marcados com
// "SITE REAL" chamam o serviço de pagamento do comerciante (ex.: Mercado Pago).

const dlg = document.getElementById('fechar');
const form = document.getElementById('fechar-form');
const PASSOS = ['fechar-form', 'passo-pix', 'passo-cartao', 'passo-pronto'];
let numeroDoPedido = '';
let relogioPix;

function mostrarPasso(id) {
  PASSOS.forEach(p => (document.getElementById(p).hidden = p !== id));
  dlg.scrollTop = 0;
  clearInterval(relogioPix);
}

function dados() {
  const d = new FormData(form);
  const entrega = d.get('modo') === 'entrega';
  const bairro = BAIRROS.find(b => b.nome === d.get('bairro')) || BAIRROS[0];
  const taxa = entrega ? bairro.taxa : 0;
  const itens = [...pedido];
  const subtotal = itens.reduce((s, [nome, q]) => s + q * precoDe.get(nome), 0);
  return {
    itens, entrega, bairro, taxa, subtotal, total: subtotal + taxa,
    nome: d.get('nome').trim(), endereco: d.get('endereco').trim(),
    horario: d.get('horario'), pagamento: d.get('pagamento'),
    troco: d.get('troco').trim(), obs: d.get('obs').trim(),
  };
}

function linhasDoResumo(p) {
  return p.itens.map(([nome, q]) => `<li><span>${q}x ${nome}</span><span>${reais(q * precoDe.get(nome))}</span></li>`).join('') +
    (p.entrega ? `<li><span>Entrega, ${p.bairro.nome}</span><span>${reais(p.taxa)}</span></li>` : '');
}

function opcoesDeHorario() {
  const { dia, horas } = agoraEmBrasilia();
  const fecha = FECHA[dia] ?? FECHA.padrao;
  const aberto = horas >= ABRE && horas < fecha;
  const opcoes = [];
  if (aberto) {
    opcoes.push('O quanto antes');
    for (let h = Math.ceil((horas + 0.5) * 2) / 2; h <= fecha - 0.5; h += 0.5) opcoes.push(`Hoje às ${hora(h)}`);
  } else {
    const quando = horas < ABRE ? 'Hoje' : 'Amanhã';
    for (let h = ABRE; h <= ABRE + 4; h += 0.5) opcoes.push(`${quando} às ${hora(h)}`);
  }
  document.getElementById('horario').innerHTML = opcoes.map(o => `<option>${o}</option>`).join('');
}

function atualizarFechamento() {
  const p = dados();
  document.getElementById('resumo').innerHTML = linhasDoResumo(p);
  document.getElementById('resumo-total').textContent = reais(p.total);
  dlg.querySelectorAll('[data-total]').forEach(el => (el.textContent = reais(p.total)));

  document.getElementById('campo-bairro').hidden = !p.entrega;
  document.getElementById('campo-endereco').hidden = !p.entrega;
  form.elements.endereco.required = p.entrega;
  document.getElementById('depois-texto').textContent = p.entrega ? 'Na entrega' : 'Na retirada';
  document.getElementById('campo-troco').hidden = p.pagamento !== 'depois';

  const online = p.pagamento !== 'depois';
  const botao = document.getElementById('botao-seguir');
  botao.textContent = online ? `Pagar ${reais(p.total)}` : 'Enviar pedido no WhatsApp';
  botao.className = online ? 'botao-pagar' : 'botao-whats';
  document.getElementById('nota-seguir').textContent = online
    ? 'Você paga aqui no site e o pedido já chega pago para a padaria.'
    : 'O WhatsApp abre com o pedido já escrito. É só apertar enviar.';
  document.getElementById('cartao-pagar').textContent = `Pagar ${reais(p.total)}`;
}

function mensagemDoPedido(pago) {
  const p = dados();
  const quando = p.horario.replace(/^O/, 'o').replace(/^Hoje/, 'hoje').replace(/^Amanhã/, 'amanhã');
  const pagamento = pago
    ? `PAGO pelo site (${p.pagamento === 'pix' ? 'Pix' : 'cartão'})`
    : `${p.entrega ? 'na entrega' : 'na retirada'}${p.troco ? `, dinheiro, troco para R$ ${p.troco}` : ''}`;
  return [
    pago ? `Olá! Pedido ${numeroDoPedido} feito e pago pelo site:` : 'Olá! Pedido pelo site:',
    '',
    ...p.itens.map(([nome, q]) => `${q}x ${nome}`),
    '',
    `Total: ${reais(p.total)}${p.entrega ? ` (com entrega de ${reais(p.taxa)})` : ''}`,
    `Nome: ${p.nome}`,
    p.entrega ? `Entrega: ${p.endereco}, ${p.bairro.nome}, ${quando}` : `Retirada no balcão, ${quando}`,
    `Pagamento: ${pagamento}`,
    ...(p.obs ? [`Obs.: ${p.obs}`] : []),
  ].join('\n');
}

// Pix: mostra o QR Code e espera a confirmação.
function abrirPix() {
  const p = dados();
  // SITE REAL: aqui o servidor pede a cobrança ao serviço de pagamento e recebe o código Pix de verdade.
  const codigo = `DEMONSTRACAO-NAO-PAGAR/${numeroDoPedido}/${p.total.toFixed(2)}/padaria-grao-dourado`;
  document.getElementById('pix-codigo').textContent = codigo;
  const caixa = document.getElementById('pix-qr');
  if (window.qrcode) {
    const qr = qrcode(0, 'M');
    qr.addData(codigo);
    qr.make();
    caixa.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 0, scalable: true });
  } else {
    caixa.textContent = 'Use o código copia e cola abaixo.';
  }
  mostrarPasso('passo-pix');

  let resta = 600;
  const tempo = document.getElementById('pix-tempo');
  const tique = () => {
    tempo.textContent = `${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}`;
    if (resta-- <= 0) mostrarPasso('fechar-form');
  };
  tique();
  relogioPix = setInterval(tique, 1000);
}

function confirmar(pago) {
  const p = dados();
  document.getElementById('pronto-titulo').textContent = pago ? 'Pagamento aprovado' : 'Pedido montado';
  document.getElementById('pronto-carimbo').textContent = pago ? 'Pago' : 'A pagar';
  document.getElementById('pronto-carimbo').classList.toggle('a-pagar', !pago);
  document.getElementById('pronto-numero').textContent = numeroDoPedido;
  const quando = p.horario.replace(/^O/, 'o').replace(/^Hoje/, 'hoje').replace(/^Amanhã/, 'amanhã');
  document.getElementById('pronto-texto').textContent = p.entrega
    ? `${p.nome}, seu pedido vai para ${p.endereco}, ${p.bairro.nome}, ${quando}.`
    : `${p.nome}, é só retirar no balcão ${quando}.`;
  document.getElementById('pronto-resumo').innerHTML = linhasDoResumo(p);
  document.getElementById('pronto-whats').href = linkWhats(mensagemDoPedido(pago));
  mostrarPasso('passo-pronto');
}

document.getElementById('bairro').innerHTML = BAIRROS.map(b => `<option value="${b.nome}">${b.nome} (${reais(b.taxa)})</option>`).join('');

document.getElementById('pedido-fechar').addEventListener('click', () => {
  numeroDoPedido = '#' + String(Math.floor(1000 + Math.random() * 9000));
  opcoesDeHorario();
  atualizarFechamento();
  mostrarPasso('fechar-form');
  dlg.showModal();
});
dlg.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', () => dlg.close()));
dlg.querySelectorAll('[data-passo]').forEach(b => b.addEventListener('click', () => mostrarPasso(b.dataset.passo)));
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('close', () => clearInterval(relogioPix));
form.addEventListener('change', atualizarFechamento);

form.addEventListener('submit', e => {
  e.preventDefault();
  const { pagamento } = dados();
  if (pagamento === 'pix') abrirPix();
  else if (pagamento === 'cartao') mostrarPasso('passo-cartao');
  else {
    window.open(linkWhats(mensagemDoPedido(false)), '_blank', 'noopener');
    confirmar(false);
  }
});

document.getElementById('pix-copiar').addEventListener('click', async e => {
  try {
    await navigator.clipboard.writeText(document.getElementById('pix-codigo').textContent);
    e.target.textContent = 'Copiado';
  } catch {
    e.target.textContent = 'Copie acima';
  }
  setTimeout(() => (e.target.textContent = 'Copiar'), 2000);
});

// SITE REAL: quem confirma é o serviço de pagamento, avisando o servidor. Aqui é um botão.
document.getElementById('pix-simular').addEventListener('click', () => confirmar(true));

document.getElementById('passo-cartao').addEventListener('submit', e => {
  e.preventDefault();
  const botao = document.getElementById('cartao-pagar');
  botao.disabled = true;
  botao.textContent = 'Processando...';
  // SITE REAL: os dados do cartão vão direto para o serviço de pagamento, nunca para o site.
  setTimeout(() => { botao.disabled = false; confirmar(true); }, 1600);
});

document.getElementById('pronto-novo').addEventListener('click', () => {
  limparPedido();
  dlg.close();
});
