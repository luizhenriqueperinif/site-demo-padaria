# Padaria Grão Dourado (site de demonstração)

Site de exemplo para comércios locais. A padaria é fictícia: serve para mostrar como fica um site simples, rápido e feito para o celular.

## O que tem

- Cardápio em que o cliente monta o pedido, escolhe retirada ou entrega (taxa por bairro) e o horário
- Pagamento pelo site com Pix ou cartão, ou na retirada, com o pedido chegando pronto no WhatsApp da loja
- Aviso de "aberto agora" e horário das fornadas, atualizados pela hora de Brasília
- Encomendas para festa, horário de funcionamento, endereço e mapa
- HTML, CSS e JavaScript puros

## Sobre o pagamento

Nesta demonstração o pagamento é simulado: nada é cobrado, o Pix não é de verdade e o cartão é um cartão de teste travado. Num site real, essa etapa é ligada à conta do comerciante em um serviço de pagamento (por exemplo, Mercado Pago) e precisa de um servidor para confirmar os pagamentos. Os pontos estão marcados no `script.js` com "SITE REAL".

## Como adaptar para um comércio

Tudo o que muda fica no começo do `script.js`: número do WhatsApp, horários, bairros de entrega e cardápio. As fotos ficam na pasta `img`.

## Créditos

As fotos são ilustrativas e foram geradas por IA. Mapa: OpenStreetMap. QR Code: qrcode-generator.

Feito por Luiz Henrique, Olímpia-SP. Contato: luizhenriqueperinif@gmail.com
