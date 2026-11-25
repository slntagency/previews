(function(){
  var d=document, w=window, rm=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}

  /* Header-schaduw */
  var kop=$('.kop');
  if(kop){var sh=function(){kop.classList.toggle('schaduw',w.scrollY>8)};sh();w.addEventListener('scroll',sh,{passive:true})}

  /* Menu */
  var hb=$('#hamburger'), pn=$('#paneel');
  if(hb&&pn){
    var zet=function(o){pn.classList.toggle('open',o);hb.setAttribute('aria-expanded',o?'true':'false')};
    hb.addEventListener('click',function(e){e.stopPropagation();zet(!pn.classList.contains('open'))});
    $$('a',pn).forEach(function(a){a.addEventListener('click',function(){zet(false)})});
    d.addEventListener('click',function(e){if(pn.classList.contains('open')&&!pn.contains(e.target))zet(false)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&pn.classList.contains('open')){zet(false);hb.focus()}});
  }

  /* Reveal, licht verspringend binnen een rij */
  var rv=$$('.reveal');
  if(rv.length){
    $$('.kaarten,.stappen,.feiten,.reviews,.bestek,.blokken').forEach(function(g){$$('.reveal',g).forEach(function(el,i){el.style.setProperty('--d',(i*0.08)+'s')})});
    if(rm||!('IntersectionObserver' in w)){rv.forEach(function(el){el.classList.add('zicht')})}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('zicht');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
      rv.forEach(function(el){io.observe(el)});
      /* Vangnet: na 4 seconden is alles zichtbaar, ook als de observer niet afgaat */
      setTimeout(function(){rv.forEach(function(el){el.classList.add('zicht')})},4000);
    }
  }

  /* Parallax: nokken en de foto in de puntgevel, alleen transform, maximaal 36px */
  var px=$$('[data-px]');
  if(px.length&&!rm){
    var tik=false;
    var doe=function(){px.forEach(function(el){var r=el.getBoundingClientRect();var m=(r.top+r.height/2-w.innerHeight/2);var f=parseFloat(el.getAttribute('data-px'));var y=Math.max(-36,Math.min(36,-m*f));el.style.transform='translateY('+y.toFixed(1)+'px)'});tik=false};
    w.addEventListener('scroll',function(){if(!tik){tik=true;requestAnimationFrame(doe)}},{passive:true});doe();
  }

  /* Tellers: de echte waarde staat in de HTML. Pas op 0 bij de start, na 1,5 s altijd de eindwaarde. */
  var tl=$$('[data-tel]');
  if(tl.length){
    var fmt=function(el,v){var dec=parseInt(el.getAttribute('data-dec')||'0',10);el.textContent=v.toFixed(dec).replace('.',',')};
    var start=function(el){var doel=parseFloat(el.getAttribute('data-tel'));if(rm||doel===0){fmt(el,doel);return}var t0=Date.now();fmt(el,0);var stap=function(){var p=Math.min(1,(Date.now()-t0)/1300);fmt(el,doel*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(stap)};requestAnimationFrame(stap);setTimeout(function(){fmt(el,doel)},1500)};
    var blokken=[];tl.forEach(function(el){var bl=el.closest('.feit')||el;if(blokken.indexOf(bl)<0)blokken.push(bl)});
    if('IntersectionObserver' in w&&!rm){var it=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$$('[data-tel]',e.target).forEach(start);it.unobserve(e.target)}})},{threshold:.2});blokken.forEach(function(bl){it.observe(bl)})}
  }

  /* Prijskaarten: op touch en tot 1024px wordt de kaart in het midden donker */
  var pk=$$('.pkaart');
  if(pk.length){
    var mq=w.matchMedia('(max-width:1024px), (hover:none)');
    var midden=function(){if(!mq.matches){pk.forEach(function(k){k.classList.remove('actief')});return}var c=w.innerHeight/2,best=null,bd=1e9;pk.forEach(function(k){var r=k.getBoundingClientRect();var dd=Math.abs(r.top+r.height/2-c);if(dd<bd){bd=dd;best=k}});pk.forEach(function(k){k.classList.toggle('actief',k===best&&bd<w.innerHeight*.4)})};
    w.addEventListener('scroll',midden,{passive:true});w.addEventListener('resize',midden);midden();
  }

  /* Swipe-rijen met dots */
  $$('[data-swipe]').forEach(function(rij){
    var dots=rij.nextElementSibling&&rij.nextElementSibling.classList.contains('dots')?rij.nextElementSibling:null;
    var items=Array.prototype.slice.call(rij.children);
    if(dots){dots.innerHTML='';items.forEach(function(it,i){var b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Ga naar kaart '+(i+1));b.addEventListener('click',function(){rij.scrollTo({left:it.offsetLeft-rij.offsetLeft-20,behavior:rm?'auto':'smooth'})});dots.appendChild(b)})}
    var upd=function(){var mid=rij.scrollLeft+rij.clientWidth/2,bi=0,bd=1e9;items.forEach(function(it,i){var c=it.offsetLeft-rij.offsetLeft+it.offsetWidth/2;var dd=Math.abs(c-mid);if(dd<bd){bd=dd;bi=i}});items.forEach(function(it,i){it.classList.toggle('in-beeld',i===bi)});if(dots)Array.prototype.forEach.call(dots.children,function(b,i){b.classList.toggle('aan',i===bi)})};
    rij.addEventListener('scroll',function(){requestAnimationFrame(upd)},{passive:true});w.addEventListener('resize',upd);upd();
  });

  /* Werkwijze: tijdlijn vult op mobiel, stippen lichten op */
  var lijst=$('.stappen');
  if(lijst){
    var stp=$$('.stap',lijst);
    var loop=function(){var lr=lijst.getBoundingClientRect();var q=Math.max(0,Math.min(1,(w.innerHeight*.6-lr.top)/lr.height));lijst.style.setProperty('--vul',(q*100).toFixed(1)+'%');stp.forEach(function(s){s.classList.toggle('aan',s.getBoundingClientRect().top<w.innerHeight*.6)})};
    if(rm){stp.forEach(function(s){s.classList.add('aan')});lijst.style.setProperty('--vul','100%')}
    else{w.addEventListener('scroll',function(){requestAnimationFrame(loop)},{passive:true});loop()}
  }

  /* Aanvraag naar WhatsApp of e-mail. Er wordt niets vanzelf verstuurd. */
  var f=$('#schetsform');
  if(f){
    var NUM='31639339551', MAIL='info@reinsmabouw.nl';
    var soort='offerte', dienst='';
    var knopO=$('#s-offerte'), knopV=$('#s-vraag'), oms=$('#oms-label'), startVeld=$('#veld-start');
    var zetSoort=function(s){soort=s;knopO.setAttribute('aria-pressed',s==='offerte');knopV.setAttribute('aria-pressed',s==='vraag');oms.textContent=s==='offerte'?'Wat wilt u laten maken?':'Wat is uw vraag?';startVeld.hidden=(s!=='offerte')};
    knopO.addEventListener('click',function(){zetSoort('offerte')});knopV.addEventListener('click',function(){zetSoort('vraag')});
    var chips=$$('#chips button');
    var zetDienst=function(v){dienst=v;chips.forEach(function(c){c.setAttribute('aria-pressed',c.getAttribute('data-waarde')===v?'true':'false')})};
    chips.forEach(function(c){c.addEventListener('click',function(){var v=c.getAttribute('data-waarde');zetDienst(dienst===v?'':v)})});
    ['naam','tel'].forEach(function(k){f[k].addEventListener('input',function(){f[k].closest('.veld').classList.remove('mis')})});
    var check=function(){var ok=true;['naam','tel'].forEach(function(k){if(!f[k].value.trim()){f[k].closest('.veld').classList.add('mis');ok=false}});if(!ok)(f.naam.value.trim()?f.tel:f.naam).focus();return ok};
    var bericht=function(){var r=[];r.push('Hallo Sander, '+(soort==='offerte'?'ik wil graag een offerte aanvragen.':'ik heb een vraag.'));if(dienst)r.push('Soort klus: '+dienst);r.push('Naam: '+f.naam.value.trim());r.push('Telefoon: '+f.tel.value.trim());if(f.plaats.value.trim())r.push('Postcode of plaats: '+f.plaats.value.trim());if(f.oms.value.trim())r.push((soort==='offerte'?'Wat ik wil laten maken: ':'Vraag: ')+f.oms.value.trim());if(soort==='offerte'&&f.start.value.trim())r.push('Gewenste start: '+f.start.value.trim());return r};
    f.addEventListener('submit',function(e){e.preventDefault();if(!check())return;var r=bericht();r.push('(Foto’s stuur ik hierna mee.)');w.open('https://wa.me/'+NUM+'?text='+encodeURIComponent(r.join('\n')),'_blank','noopener')});
    $('#per-mail').addEventListener('click',function(){if(!check())return;var r=bericht();r.push('(Foto’s voeg ik als bijlage toe.)');w.location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(soort==='offerte'?'Offerte-aanvraag'+(dienst?' '+dienst.toLowerCase():''):'Vraag')+'&body='+encodeURIComponent(r.join('\n'))});
    /* CTA's vullen de aanvraag vooraf in */
    var vul=function(s,dn){zetSoort(s==='vraag'?'vraag':'offerte');if(dn){var c=chips.filter(function(c){return c.getAttribute('data-sleutel')===dn})[0];if(c)zetDienst(c.getAttribute('data-waarde'))}};
    $$('[data-soort]').forEach(function(a){a.addEventListener('click',function(){vul(a.getAttribute('data-soort'),a.getAttribute('data-dienst'))})});
    var q=new URLSearchParams(w.location.search);if(q.get('soort')||q.get('dienst'))vul(q.get('soort')||'offerte',q.get('dienst'));
  }
})();
