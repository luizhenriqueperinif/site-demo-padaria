// ---- O que muda de um comércio para outro fica aqui em cima ----

// WhatsApp do comércio: só dígitos, com 55 + DDD. Vazio = o WhatsApp abre para escolher o contato.
const WHATSAPP = '';

// Horas das fornadas (11.5 = 11h30). Domingo a padaria fecha ao meio-dia.
const FORNADAS = [6, 9, 11.5, 15, 17.5];
const FECHA = { 0: 12, 6: 19, padrao: 20 };
const ABRE = 6;

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
  const linhas = itens.map(([nome, q]) => `${q}x ${nome}`).join('\n');
  document.getElementById('pedido-enviar').href = linkWhats(
    `Olá! Quero fazer um pedido pelo site:\n\n${linhas}\n\nTotal estimado: ${reais(total)}\nVou retirar no balcão.`);
}

document.getElementById('pedido-limpar').addEventListener('click', () => {
  pedido.clear();
  document.querySelectorAll('.item.escolhido').forEach(li => atualizarItem(li, 0));
  atualizarBarra();
});

document.querySelectorAll('[data-whats]').forEach(a => {
  a.href = linkWhats(a.dataset.whats);
  a.target = '_blank';
  a.rel = 'noopener';
});

montarCardapio();
horarios();
setInterval(horarios, 60000);
