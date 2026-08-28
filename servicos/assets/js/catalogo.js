/* MAPOS-CATALOGO-PUBLICO v1.4.0 - busca popular automatica e configuravel */
(function(){
'use strict';

var cfg=window.CATALOGO_CONFIG||{},data=null,query='',category='all';
var el={
  loading:document.getElementById('loading-state'),error:document.getElementById('error-state'),errorDetail:document.getElementById('error-detail'),
  servicesSection:document.getElementById('services-section'),serviceGrid:document.getElementById('service-grid'),
  filters:document.getElementById('category-filters'),search:document.getElementById('service-search'),clear:document.getElementById('clear-search'),
  shortcuts:document.getElementById('problem-shortcuts'),empty:document.getElementById('empty-state'),reset:document.getElementById('reset-filters'),count:document.getElementById('result-count'),
  updated:document.getElementById('catalog-updated'),headerWhats:document.getElementById('header-whatsapp'),
  helpWhats:document.getElementById('help-whatsapp'),emptyWhats:document.getElementById('empty-whatsapp'),mobileWhats:document.getElementById('mobile-whatsapp'),footer:document.getElementById('footer-text'),
  title:document.getElementById('services-title'),sectionHelp:document.getElementById('section-help')
};

function hide(node){if(node)node.hidden=true}
function show(node){if(node)node.hidden=false}
function normalize(v){
  var s=(v||'').toString();
  try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')}catch(e){}
  return s.toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/^\s+|\s+$/g,'');
}
function tokens(v){
  var stop={meu:1,minha:1,meus:1,minhas:1,o:1,a:1,os:1,as:1,de:1,do:1,da:1,dos:1,das:1,um:1,uma:1,pra:1,para:1,com:1,sem:1,e:1,que:1,ta:1,esta:1,muito:1,muita:1,muitos:1,muitas:1,quero:1,preciso:1,queria:1,precisava:1,colocar:1,coloque:1,trocar:1,troque:1,pc:1,computador:1,notebook:1,maquina:1,aqui:1,me:1,meu:1,na:1,no:1,nas:1,nos:1};
  return normalize(v).split(/\s+/).filter(function(x){return x&&!stop[x]});
}
function validPayload(payload){return !!payload&&Array.isArray(payload.categories)&&Array.isArray(payload.services)}
function categoryObj(id){return(data.categories||[]).find(function(x){return String(x.id)===String(id)})||null}
function rawCategoryName(id){var c=categoryObj(id);return c?c.name:'Outros'}
function friendlyCategory(name){
  var n=normalize(name),map={
    'computadores e sistemas':'Computador e Windows',
    'hardware':'Peças e upgrades',
    'manutencao':'Limpeza e cuidados',
    'diagnostico':'Descobrir o problema',
    'atendimento':'Técnico no local',
    'redes e internet':'Wi-Fi e internet'
  };
  return map[n]||name||'Outros';
}

var friendlyNames={
  'kit formatacao':'Formatação completa',
  'rem virus':'Remover vírus',
  'instalacao de drivers':'Instalar drivers',
  'atualizacao bios uefi':'Atualizar BIOS / UEFI',
  'inst windows':'Instalar Windows',
  'otimizacao do sistema':'Deixar o computador mais rápido',
  'clonagem ssd hd':'Passar tudo para outro SSD / HD',
  'instalacao de ssd hd sistema':'Instalar SSD / HD + Windows',
  'troca de peca simples':'Trocar uma peça',
  'troca bateria notebook':'Trocar bateria do notebook',
  'troca tela notebook':'Trocar tela do notebook',
  'troca de fan cooler':'Trocar cooler / ventoinha',
  'limpeza preventiva':'Limpeza preventiva',
  'limpeza basica':'Limpeza básica',
  'limpeza completa':'Limpeza completa',
  'limpeza pasta termica':'Limpeza + pasta térmica',
  'diagnostico basico':'Descobrir o problema (básico)',
  'diagnostico avancado':'Descobrir o problema (completo)',
  'visita tecnica':'Técnico no local',
  'configuracao de roteador':'Configurar Wi-Fi / roteador',
  'configuracao de rede domestica':'Organizar Wi-Fi / rede da casa',
  'recuperacao de dados simples':'Recuperar arquivos, fotos e documentos',
  'recuperacao de dados':'Recuperar arquivos, fotos e documentos'
};

var friendlyDescriptions={
  'kit formatacao':'Formata o computador, instala o Windows, drivers e programas básicos. Inclui backup conforme o serviço cadastrado.',
  'rem virus':'Remove vírus, programas maliciosos e outras ameaças que podem deixar o computador estranho ou lento.',
  'instalacao de drivers':'Instala os drivers para som, vídeo, internet, Wi-Fi e outros componentes funcionarem corretamente.',
  'atualizacao bios uefi':'Atualiza o sistema interno da placa-mãe quando esse procedimento é necessário.',
  'inst windows':'Instala o Windows no computador e deixa o sistema pronto para a configuração dos programas.',
  'otimizacao do sistema':'Faz ajustes para melhorar o desempenho quando o computador está lento ou travando.',
  'clonagem ssd hd':'Copia seus dados e o sistema de um HD ou SSD para outro, evitando começar tudo do zero quando possível.',
  'instalacao de ssd hd sistema':'Instala o novo HD ou SSD e também prepara o sistema operacional.',
  'troca de peca simples':'Troca uma peça ou componente simples do computador.',
  'troca bateria notebook':'Substitui a bateria do notebook quando ela não segura carga ou já está ruim.',
  'troca tela notebook':'Substitui a tela do notebook em casos de quebra, manchas ou defeito de imagem.',
  'troca de fan cooler':'Troca a ventoinha/cooler quando há barulho, falha de ventilação ou aquecimento.',
  'limpeza preventiva':'Remove poeira e sujeira por dentro para ajudar na ventilação e evitar superaquecimento.',
  'limpeza basica':'Limpeza simples para remover poeira e sujeira da parte externa e áreas acessíveis.',
  'limpeza completa':'Higienização mais completa do computador, indicada quando há muita sujeira acumulada.',
  'limpeza pasta termica':'Faz a limpeza e troca a pasta térmica para ajudar no controle da temperatura.',
  'diagnostico basico':'Testes iniciais para descobrir por que o computador não liga, trava ou apresenta algum defeito.',
  'diagnostico avancado':'Testes mais completos para encontrar defeitos difíceis ou problemas que aparecem de vez em quando.',
  'visita tecnica':'Atendimento no local para avaliar e resolver problemas em computadores, rede ou equipamentos.',
  'configuracao de roteador':'Configura internet, Wi-Fi, nome da rede, senha e ajustes básicos do roteador.',
  'configuracao de rede domestica':'Organiza a rede da casa, conexão dos aparelhos e ajustes do Wi-Fi.',
  'recuperacao de dados simples':'Tenta recuperar arquivos, fotos e documentos apagados ou perdidos, conforme o estado do dispositivo.',
  'recuperacao de dados':'Tenta recuperar arquivos, fotos e documentos apagados ou perdidos, conforme o estado do dispositivo.'
};

/*
 * Frases extras sem mexer no codigo:
 * No campo Descricao de qualquer servico, adicione no final:
 * [busca: apaguei minhas fotos; perdi meus arquivos; quero recuperar documentos]
 * O trecho entre [busca: ...] entra na busca, mas nao aparece para o cliente.
 */
function customSearchHints(service){
  var source=(service&&service.description)||'',found=[],re=/\[(?:busca|buscar|termos?|cliente)\s*:\s*([^\]]+)\]/gi,m;
  while((m=re.exec(source))!==null){if(m[1])found.push(m[1].replace(/[;,|]+/g,' '))}
  return found.join(' ');
}
function stripSearchHints(value){
  return (value||'').toString().replace(/\s*\[(?:busca|buscar|termos?|cliente)\s*:\s*[^\]]+\]\s*/gi,' ').replace(/\s{2,}/g,' ').replace(/^\s+|\s+$/g,'');
}

/*
 * Pacotes automaticos de linguagem popular.
 * Se um servico novo tiver nome/descricao relacionado ao assunto, ele herda
 * automaticamente as frases que um cliente comum provavelmente digitara.
 */
var intentPacks=[
  {id:'nao-liga',label:'Não liga',detect:['diagnostico','placa mae','fonte','reparo'],aliases:'nao liga nao acende nao da sinal morreu apagado aperto botao nada acontece sem energia sem sinal',query:'nao liga'},
  {id:'lento',label:'Está lento ou travando',detect:['otimizacao','formatacao','windows','ssd','diagnostico'],aliases:'lento travando trava demora demorando pesado engasgando congelando lerdo nao responde fica pensando demora abrir demora ligar',query:'lento travando'},
  {id:'quente',label:'Está esquentando',detect:['limpeza','pasta termica','fan','cooler','ventoinha'],aliases:'esquentando aquecendo quente temperatura superaquecendo superaquece barulho ventilador ventoinha fan cooler',query:'esquentando'},
  {id:'formatar',label:'Quero formatar',detect:['formatacao','inst windows','instalacao windows','windows'],aliases:'formatar formatacao reinstalar windows zerar sistema instalar windows limpar sistema comecar do zero',query:'formatar windows'},
  {id:'virus',label:'Vírus ou propaganda',detect:['virus','malware','formatacao'],aliases:'virus malware propaganda anuncio popup pop up janela abrindo sozinho pagina abrindo sozinho infectado invasao estranho navegador',query:'virus propaganda'},
  {id:'ssd',label:'Quero colocar SSD / HD',detect:['ssd','hd','clonagem','armazenamento'],aliases:'ssd hd disco armazenamento upgrade colocar ssd trocar hd sem espaco pouco espaco armazenamento cheio passar tudo copiar disco',query:'ssd hd'},
  {id:'dados',label:'Perdi arquivos ou fotos',detect:['recuperacao de dados','recuperar dados','recuperacao arquivos','recuperar arquivos','restauracao de dados'],aliases:'recuperacao recuperar dados arquivo arquivos foto fotos documento documentos video videos apaguei apagou deletei deletou exclui excluiu perdi perdeu sumiu sumiram formatei formatou formataram formatado sem querer lixeira pendrive cartao memoria hd ssd quero minhas fotos quero meus arquivos',query:'perdi arquivos fotos'},
  {id:'tela',label:'Tela do notebook',detect:['troca tela','tela notebook','display'],aliases:'tela quebrada tela preta mancha manchas listras risco riscos display sem imagem imagem ruim vidro quebrado tela piscando',query:'tela notebook'},
  {id:'bateria',label:'Bateria ruim',detect:['bateria'],aliases:'bateria ruim nao segura carga descarrega rapido nao carrega inchada viciada dura pouco desliga fora tomada',query:'bateria ruim'},
  {id:'carregador',label:'Não carrega',detect:['conector','jack','carga','carregador','fonte notebook','bateria'],aliases:'nao carrega carregador nao funciona conector carga jack fonte notebook plugue cabo energia so carrega mexendo',query:'nao carrega'},
  {id:'wifi',label:'Wi-Fi ou internet ruim',detect:['roteador','rede domestica','wifi','wi fi','internet','rede'],aliases:'wifi wi fi internet roteador senha sinal fraco cair caindo cai desconecta nao conecta sem internet internet lenta rede casa modem',query:'wifi internet'},
  {id:'visita',label:'Quero técnico no local',detect:['visita tecnica','atendimento no local','domicilio'],aliases:'visita tecnico local casa empresa domicilio presencial vir aqui atendimento no local',query:'visita tecnico local'},
  {id:'backup',label:'Quero fazer backup',detect:['backup','clonagem','dados'],aliases:'backup copia salvar arquivos guardar fotos documentos seguranca copiar dados antes formatar',query:'backup arquivos'},
  {id:'azul',label:'Tela azul ou reiniciando',detect:['diagnostico','windows','memoria ram','ram'],aliases:'tela azul reinicia reiniciando sozinho desliga sozinho erro azul blue screen trava reinicia',query:'tela azul reinicia'},
  {id:'sem-imagem',label:'Liga, mas não dá imagem',detect:['diagnostico','placa de video','video','tela'],aliases:'liga sem imagem nao da video sem video tela preta monitor sem sinal computador liga mas nao aparece imagem',query:'liga sem imagem'},
  {id:'teclado',label:'Teclado ou touchpad',detect:['teclado','touchpad','mouse'],aliases:'teclado nao funciona tecla teclas falhando touchpad mouse notebook cursor clique nao funciona',query:'teclado touchpad'},
  {id:'som',label:'Sem som',detect:['driver','audio','som','alto falante'],aliases:'sem som audio nao funciona nao sai som alto falante microfone fone driver audio',query:'sem som audio'},
  {id:'camera',label:'Câmera não funciona',detect:['camera','webcam','driver'],aliases:'camera webcam nao funciona video chamada meet zoom camera preta driver camera',query:'camera webcam'},
  {id:'memoria',label:'Quero mais memória RAM',detect:['memoria ram','ram','upgrade'],aliases:'memoria ram aumentar memoria colocar ram upgrade mais memoria computador lento',query:'memoria ram'},
  {id:'impressora',label:'Problema com impressora',detect:['impressora','printer'],aliases:'impressora nao imprime papel atolado offline nao reconhece configurar impressora instalar impressora',query:'impressora'}
];

function serviceKey(service){return normalize(service&&service.name)}
function friendlyServiceName(service){return friendlyNames[serviceKey(service)]||(service.name||'Serviço')}
function friendlyDescription(service){
  var key=serviceKey(service);
  return friendlyDescriptions[key]||stripSearchHints(service.description||'')||'Se tiver dúvida, chama a gente que explicamos direitinho.';
}
function baseServiceText(service){
  return normalize((service.name||'')+' '+stripSearchHints(service.description||'')+' '+rawCategoryName(service.category_id));
}
function packApplies(service,pack){
  var hay=baseServiceText(service),terms=pack.detect||[];
  return terms.some(function(term){return hay.indexOf(normalize(term))!==-1});
}
function automaticAliases(service){
  var out=[];
  intentPacks.forEach(function(pack){if(packApplies(service,pack))out.push(pack.aliases)});
  return out.join(' ');
}
function searchText(service){
  return normalize(
    (service.name||'')+' '+friendlyServiceName(service)+' '+stripSearchHints(service.description||'')+' '+friendlyDescription(service)+' '+
    rawCategoryName(service.category_id)+' '+friendlyCategory(rawCategoryName(service.category_id))+' '+customSearchHints(service)+' '+automaticAliases(service)
  );
}
function serviceMatchesQuery(service,q){
  if(!q)return true;
  var hay=searchText(service),parts=tokens(q);
  if(!parts.length)return true;
  return parts.every(function(part){return hay.indexOf(part)!==-1});
}
function visibleServices(){
  return(data.services||[]).filter(function(s){
    if(category!=='all'&&String(s.category_id)!==String(category))return false;
    return serviceMatchesQuery(s,query);
  });
}

function whatsappBase(){return((data.settings||{}).whatsapp||'').replace(/\D/g,'')}
function waUrl(service){
  var phone=whatsappBase();if(!phone)return'';
  var company=cfg.companyName||'empresa';
  var msg='Oi! Vi o serviço "'+friendlyServiceName(service)+'" na tabela de preços da '+company+'. Quero saber como funciona.';
  return'https://wa.me/'+phone+'?text='+encodeURIComponent(msg);
}
function generalWaUrl(){
  var phone=whatsappBase();if(!phone)return'';
  return'https://wa.me/'+phone+'?text='+encodeURIComponent('Oi! Preciso de ajuda com meu computador/equipamento. Posso explicar o que está acontecendo?');
}
function money(value){
  try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0)}
  catch(e){return'R$ '+(Number(value)||0).toFixed(2).replace('.',',')}
}
function priceBlock(service){
  var wrap=document.createElement('div');wrap.className='price-area';
  var label=document.createElement('span');label.className='price-label';label.textContent='Valor';wrap.appendChild(label);
  var box=document.createElement('div');box.className='price';
  if(service.price_type==='orcamento'){
    box.className+=' price-quote';box.textContent='Precisa avaliar';wrap.appendChild(box);return wrap;
  }
  if(service.price_type==='a_partir'){
    var small=document.createElement('small');small.textContent='A partir de';box.appendChild(small);
  }
  box.appendChild(document.createTextNode(money(service.price)));wrap.appendChild(box);return wrap;
}
function card(service){
  var article=document.createElement('article');article.className='service-card'+(service.featured?' featured':'');article.id='servico-'+service.id;
  var main=document.createElement('div');main.className='service-main';
  var top=document.createElement('div');top.className='service-card-top';
  var cat=document.createElement('span');cat.className='category';cat.textContent=friendlyCategory(rawCategoryName(service.category_id));top.appendChild(cat);
  if(service.featured){var popular=document.createElement('span');popular.className='popular-badge';popular.textContent='Mais pedido';top.appendChild(popular)}
  var friendly=friendlyServiceName(service),h=document.createElement('h3');h.textContent=friendly;
  main.appendChild(top);main.appendChild(h);
  if(normalize(friendly)!==normalize(service.name||'')){
    var original=document.createElement('span');original.className='service-original-name';original.textContent='Nome do serviço: '+service.name;main.appendChild(original);
  }
  var p=document.createElement('p');p.className='service-description';p.textContent=friendlyDescription(service);main.appendChild(p);

  var action=document.createElement('div');action.className='service-action';action.appendChild(priceBlock(service));
  var a=document.createElement('a'),url=waUrl(service);a.className='quote-button';a.textContent='Quero esse serviço';
  if(url){a.href=url;a.target='_blank';a.rel='noopener noreferrer'}
  else{a.href='#';a.className+=' disabled';a.setAttribute('aria-disabled','true');a.textContent='Fale com a loja';a.addEventListener('click',function(ev){ev.preventDefault()})}
  action.appendChild(a);article.appendChild(main);article.appendChild(action);return article;
}
function filterButton(label,id){
  var active=String(category)===String(id),b=document.createElement('button');b.type='button';b.className='filter-button'+(active?' active':'');
  b.textContent=label;b.setAttribute('aria-pressed',String(active));
  b.addEventListener('click',function(){category=id;query='';if(el.search)el.search.value='';clearShortcutActive();render()});
  return b;
}
function renderFilters(){
  if(!el.filters)return;el.filters.textContent='';el.filters.appendChild(filterButton('Ver tudo','all'));
  (data.categories||[]).forEach(function(c){el.filters.appendChild(filterButton(friendlyCategory(c.name),c.id))});
}
function clearShortcutActive(){
  if(!el.shortcuts)return;
  Array.prototype.forEach.call(el.shortcuts.querySelectorAll('button'),function(b){b.classList.remove('active')});
}
function availableIntentPacks(){
  var services=data&&data.services?data.services:[],available=[];
  intentPacks.forEach(function(pack){
    var exists=services.some(function(service){return packApplies(service,pack)});
    if(exists)available.push(pack);
  });
  return available.slice(0,14);
}
function renderShortcuts(){
  if(!el.shortcuts)return;
  el.shortcuts.textContent='';
  availableIntentPacks().forEach(function(pack){
    var b=document.createElement('button');b.type='button';b.setAttribute('data-query',pack.query);b.textContent=pack.label;el.shortcuts.appendChild(b);
  });
}
function applyShortcut(button){
  if(!button)return;query=button.getAttribute('data-query')||'';category='all';if(el.search)el.search.value='';clearShortcutActive();button.classList.add('active');render();
  var target=document.getElementById('servicos');if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
}
function safeHashScroll(){
  if(!location.hash)return;
  try{var target=document.querySelector(location.hash);if(target)setTimeout(function(){target.scrollIntoView({behavior:'smooth',block:'center'})},80)}catch(e){}
}
function render(){
  if(!data)return;renderFilters();var services=visibleServices();
  if(el.serviceGrid){el.serviceGrid.textContent='';services.forEach(function(s){el.serviceGrid.appendChild(card(s))})}
  if(el.count)el.count.textContent=services.length+' '+(services.length===1?'serviço':'serviços');
  if(el.title)el.title.textContent=(query||category!=='all')?'Serviços que podem ajudar':'Todos os serviços';
  if(el.sectionHelp)el.sectionHelp.textContent=(query||category!=='all')?'Veja as opções encontradas para o que você escolheu.':'Veja os serviços e preços disponíveis.';
  if(services.length){show(el.servicesSection);hide(el.empty)}else{hide(el.servicesSection);show(el.empty)}
  if(el.clear)el.clear.hidden=!query;safeHashScroll();
}
function applyMeta(){
  if(el.updated&&data.updated_at){
    try{el.updated.textContent='Preços atualizados em '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'short'}).format(new Date(data.updated_at))}
    catch(e){el.updated.textContent='Preços atualizados recentemente'}
  }
  if(el.footer&&(data.settings||{}).footer_text)el.footer.textContent=data.settings.footer_text;
  var url=generalWaUrl();
  [el.headerWhats,el.helpWhats,el.emptyWhats,el.mobileWhats].forEach(function(node){
    if(!node)return;if(url){show(node);node.href=url;node.target='_blank';node.rel='noopener noreferrer'}else{hide(node)}
  });
}
function start(payload){
  if(!validPayload(payload))throw new Error('Dados públicos inválidos.');
  data=payload;hide(el.loading);hide(el.error);applyMeta();renderShortcuts();render();
}
function fail(message){
  hide(el.loading);hide(el.servicesSection);hide(el.empty);show(el.error);if(el.errorDetail&&message)el.errorDetail.textContent=message;
}
function refreshFromJson(){
  if(!cfg.dataUrl||typeof fetch!=='function')return;
  var controller=typeof AbortController==='function'?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort()},8000):null;
  var options={cache:'no-store',headers:{Accept:'application/json'}};if(controller)options.signal=controller.signal;
  fetch(cfg.dataUrl,options)
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(function(payload){if(!validPayload(payload))throw new Error('JSON inválido');if(!data||String(payload.version||'')!==String(data.version||''))start(payload)})
    .catch(function(){if(!data)fail('Não consegui carregar os preços publicados. Tente novamente.')})
    .finally(function(){if(timer)clearTimeout(timer)});
}

if(el.search)el.search.addEventListener('input',function(){query=this.value;category='all';clearShortcutActive();render()});
if(el.clear)el.clear.addEventListener('click',function(){query='';category='all';if(el.search){el.search.value='';el.search.focus()}clearShortcutActive();render()});
if(el.reset)el.reset.addEventListener('click',function(){query='';category='all';if(el.search)el.search.value='';clearShortcutActive();render();if(el.search)el.search.focus()});
if(el.shortcuts)el.shortcuts.addEventListener('click',function(ev){var button=ev.target.closest?ev.target.closest('button[data-query]'):null;if(button&&el.shortcuts.contains(button))applyShortcut(button)});

try{
  if(validPayload(cfg.embeddedData||cfg.previewData)){start(cfg.embeddedData||cfg.previewData);refreshFromJson()}
  else if(cfg.dataUrl){refreshFromJson()}
  else{fail('Nenhum preço foi encontrado.')}
}catch(e){fail('Não consegui montar a tabela de preços. Atualize a página e tente de novo.')}
})();
