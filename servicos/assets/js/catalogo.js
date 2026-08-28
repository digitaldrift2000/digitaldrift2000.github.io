/* MAPOS-CATALOGO-PUBLICO v1.1.0 - pagina publica simples */
(function(){
'use strict';
var cfg=window.CATALOGO_CONFIG||{},data=null,query='',category='all';
var el={
  loading:document.getElementById('loading-state'),error:document.getElementById('error-state'),errorDetail:document.getElementById('error-detail'),
  servicesSection:document.getElementById('services-section'),serviceGrid:document.getElementById('service-grid'),
  filters:document.getElementById('category-filters'),search:document.getElementById('service-search'),clear:document.getElementById('clear-search'),
  empty:document.getElementById('empty-state'),reset:document.getElementById('reset-filters'),count:document.getElementById('result-count'),
  updated:document.getElementById('catalog-updated'),headerWhats:document.getElementById('header-whatsapp'),
  helpWhats:document.getElementById('help-whatsapp'),mobileWhats:document.getElementById('mobile-whatsapp'),footer:document.getElementById('footer-text')
};
function hide(node){if(node)node.hidden=true}
function show(node){if(node)node.hidden=false}
function normalize(v){
  var s=(v||'').toString();
  try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')}catch(e){}
  return s.toLowerCase();
}
function validPayload(payload){return !!payload&&Array.isArray(payload.categories)&&Array.isArray(payload.services)}
function categoryObj(id){return(data.categories||[]).find(function(x){return String(x.id)===String(id)})||null}
function categoryName(id){var c=categoryObj(id);return c?c.name:'Outros'}
function visibleServices(){
  var q=normalize(query);
  return(data.services||[]).filter(function(s){
    if(category!=='all'&&String(s.category_id)!==String(category))return false;
    if(!q)return true;
    return normalize((s.name||'')+' '+(s.description||'')+' '+categoryName(s.category_id)).indexOf(q)!==-1;
  });
}
function whatsappBase(){return((data.settings||{}).whatsapp||'').replace(/\D/g,'')}
function waUrl(service){
  var phone=whatsappBase();
  if(!phone)return'';
  var msg='Olá! Vi a tabela de preços e gostaria de atendimento para: '+service.name+'.';
  return'https://wa.me/'+phone+'?text='+encodeURIComponent(msg);
}
function generalWaUrl(){
  var phone=whatsappBase();
  if(!phone)return'';
  return'https://wa.me/'+phone+'?text='+encodeURIComponent('Olá! Vi a tabela de preços e preciso de ajuda para escolher o serviço certo.');
}
function money(value){
  try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0)}
  catch(e){return'R$ '+(Number(value)||0).toFixed(2).replace('.',',')}
}
function priceBlock(service){
  var wrap=document.createElement('div');wrap.className='price-area';
  var label=document.createElement('span');label.className='price-label';label.textContent='Preço';wrap.appendChild(label);
  var box=document.createElement('div');box.className='price';
  if(service.price_type==='orcamento'){
    box.className+=' price-quote';box.textContent='Sob orçamento';wrap.appendChild(box);return wrap;
  }
  if(service.price_type==='a_partir'){
    var small=document.createElement('small');small.textContent='A partir de';box.appendChild(small);
  }
  box.appendChild(document.createTextNode(money(service.price)));wrap.appendChild(box);return wrap;
}
function card(service){
  var article=document.createElement('article');article.className='service-card'+(service.featured?' featured':'');article.id='servico-'+service.id;
  var top=document.createElement('div');top.className='service-card-top';
  var cat=document.createElement('span');cat.className='category';cat.textContent=categoryName(service.category_id);top.appendChild(cat);
  if(service.featured){var popular=document.createElement('span');popular.className='popular-badge';popular.textContent='Mais pedido';top.appendChild(popular)}
  var h=document.createElement('h3');h.textContent=service.name||'Serviço';
  var price=priceBlock(service);
  var p=document.createElement('p');p.className='service-description';p.textContent=service.description||'Fale com o atendimento para saber o que está incluído neste serviço.';
  var a=document.createElement('a'),url=waUrl(service);a.className='quote-button';a.textContent='Quero este serviço';
  if(url){a.href=url;a.target='_blank';a.rel='noopener noreferrer'}
  else{a.href='#';a.className+=' disabled';a.setAttribute('aria-disabled','true');a.textContent='Entre em contato para solicitar';a.addEventListener('click',function(ev){ev.preventDefault()})}
  article.appendChild(top);article.appendChild(h);article.appendChild(price);article.appendChild(p);article.appendChild(a);return article;
}
function filterButton(label,id){
  var active=String(category)===String(id),b=document.createElement('button');b.type='button';b.className='filter-button'+(active?' active':'');
  b.textContent=label;b.setAttribute('aria-pressed',String(active));
  b.addEventListener('click',function(){category=id;render()});return b;
}
function renderFilters(){
  if(!el.filters)return;el.filters.textContent='';el.filters.appendChild(filterButton('Todos os serviços','all'));
  (data.categories||[]).forEach(function(c){el.filters.appendChild(filterButton(c.name,c.id))});
}
function safeHashScroll(){
  if(!location.hash)return;
  try{var target=document.querySelector(location.hash);if(target)setTimeout(function(){target.scrollIntoView({behavior:'smooth',block:'center'})},80)}catch(e){}
}
function render(){
  if(!data)return;
  renderFilters();
  var services=visibleServices();
  if(el.serviceGrid){el.serviceGrid.textContent='';services.forEach(function(s){el.serviceGrid.appendChild(card(s))})}
  if(el.count)el.count.textContent=services.length+' '+(services.length===1?'serviço encontrado':'serviços encontrados');
  if(services.length){show(el.servicesSection);hide(el.empty)}else{hide(el.servicesSection);show(el.empty)}
  if(el.clear)el.clear.hidden=!query;
  safeHashScroll();
}
function applyMeta(){
  if(el.updated&&data.updated_at){
    try{el.updated.textContent='Preços atualizados em '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(data.updated_at))}
    catch(e){el.updated.textContent='Preços atualizados recentemente'}
  }
  if(el.footer&&(data.settings||{}).footer_text)el.footer.textContent=data.settings.footer_text;
  var url=generalWaUrl();
  [el.headerWhats,el.helpWhats,el.mobileWhats].forEach(function(node){
    if(!node)return;
    if(url){show(node);node.href=url;node.target='_blank';node.rel='noopener noreferrer'}else{hide(node)}
  });
}
function start(payload){
  if(!validPayload(payload))throw new Error('Dados públicos inválidos.');
  data=payload;hide(el.loading);hide(el.error);applyMeta();render();
}
function fail(message){
  hide(el.loading);hide(el.servicesSection);hide(el.empty);show(el.error);
  if(el.errorDetail&&message)el.errorDetail.textContent=message;
}
function refreshFromJson(){
  if(!cfg.dataUrl||typeof fetch!=='function')return;
  var controller=typeof AbortController==='function'?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort()},8000):null;
  var options={cache:'no-store',headers:{Accept:'application/json'}};if(controller)options.signal=controller.signal;
  fetch(cfg.dataUrl,options).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(payload){
    if(!validPayload(payload))throw new Error('JSON inválido');
    if(!data||String(payload.version||'')!==String(data.version||''))start(payload);
  }).catch(function(){if(!data)fail('Não foi possível carregar os dados publicados.')}).finally(function(){if(timer)clearTimeout(timer)});
}
if(el.search)el.search.addEventListener('input',function(){query=this.value;render()});
if(el.clear)el.clear.addEventListener('click',function(){query='';if(el.search){el.search.value='';el.search.focus()}render()});
if(el.reset)el.reset.addEventListener('click',function(){query='';category='all';if(el.search)el.search.value='';render();if(el.search)el.search.focus()});
try{
  if(validPayload(cfg.embeddedData||cfg.previewData)){start(cfg.embeddedData||cfg.previewData);refreshFromJson()}
  else if(cfg.dataUrl){refreshFromJson()}
  else{fail('Nenhum dado público foi encontrado.')}
}catch(e){fail('Não foi possível montar a tabela de preços. Atualize a página e tente novamente.')}
})();
