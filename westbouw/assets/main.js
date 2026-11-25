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
    var zet=function(o){pn.classList.toggle('open',o);hb.setAttribute('aria-expanded',o?'true':'false');hb.setAttribute('aria-label',o?'Menu sluiten':'Menu openen')};
    hb.addEventListener('click',function(e){e.stopPropagation();zet(!pn.classList.contains('open'))});
    $$('a',pn).forEach(function(a){a.addEventListener('click',function(){zet(false)})});
    d.addEventListener('click',function(e){if(pn.classList.contains('open')&&!pn.contains(e.target))zet(false)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&pn.classList.contains('open')){zet(false);hb.focus()}});
  }

  /* Reveal: alleen koppen en tekstblokken, nooit kaarten. Vangnet: na 4 s is alles zichtbaar. */
  var rv=$$('.reveal');
  if(rv.length){
    if(rm||!('IntersectionObserver' in w)){rv.forEach(function(el){el.classList.add('zicht')})}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('zicht');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
      rv.forEach(function(el){io.observe(el)});
      setTimeout(function(){rv.forEach(function(el){el.classList.add('zicht')})},4000);
    }
  }

  /* Parallax: de daklijnen op de tint-vlakken en de foto in het over-kader. Alleen transform, maximaal 28px. Nooit kaarten. */
  var px=$$('[data-px]');
  if(px.length&&!rm){
    var tik=false;
    var doe=function(){px.forEach(function(el){var r=el.getBoundingClientRect();var m=(r.top+r.height/2-w.innerHeight/2);var f=parseFloat(el.getAttribute('data-px'));var y=Math.max(-28,Math.min(28,-m*f));el.style.transform='translateY('+y.toFixed(1)+'px)'});tik=false};
    w.addEventListener('scroll',function(){if(!tik){tik=true;requestAnimationFrame(doe)}},{passive:true});doe();
  }

  /* Tellers: de echte waarde staat in de HTML. Pas op 0 bij de start, na 1,5 s altijd de eindwaarde. */
  var tl=$$('[data-tel]');
  if(tl.length&&!rm&&('IntersectionObserver' in w)){
    var fmt=function(el,v){var dec=parseInt(el.getAttribute('data-dec')||'0',10);el.textContent=v.toFixed(dec).replace('.',',')};
    var start=function(el){var doel=parseFloat(el.getAttribute('data-tel'));var t0=Date.now();fmt(el,0);
      var stap=function(){var p=Math.min(1,(Date.now()-t0)/1200);fmt(el,doel*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(stap)};
      requestAnimationFrame(stap);setTimeout(function(){fmt(el,doel)},1500)};
    var it=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){start(e.target);it.unobserve(e.target)}})},{threshold:.3});
    tl.forEach(function(el){it.observe(el)});
  }

  /* Werkwijze: op mobiel vult de stijl van het raam tijdens het scrollen en lichten de ruiten op */
  var raam=$('.raam-stappen');
  if(raam){
    var rt=$$('.ruit',raam);
    if(rm){rt.forEach(function(s){s.classList.add('aan')});raam.style.setProperty('--vul','1')}
    else{
      var loop=function(){var lr=raam.getBoundingClientRect();var q=Math.max(0,Math.min(1,(w.innerHeight*.6-lr.top)/lr.height));raam.style.setProperty('--vul',q.toFixed(3));rt.forEach(function(s){s.classList.toggle('aan',s.getBoundingClientRect().top<w.innerHeight*.6)})};
      w.addEventListener('scroll',function(){requestAnimationFrame(loop)},{passive:true});w.addEventListener('resize',loop);loop();
    }
  }

  /* Formulier: maakt een ingevuld bericht. Er wordt niets vanzelf verstuurd.
     WhatsApp op het 06-nummer is niet bevestigd (feitenblad sectie 3), wel het e-mailadres info@westbouw.eu. Daarom KANAAL='mail': het e-mailprogramma opent met het bericht.
     Bevestigt de eigenaar WhatsApp: zet KANAAL op 'whatsapp' en NUM op '31641512390', en pas de knoptekst in de HTML aan. */
  var f=$('#berichtform');
  if(f){
    var KANAAL='mail', NUM='', MAIL='info@westbouw.eu';
    var soort='offerte', dienst='';
    var knopO=$('#s-offerte'), knopV=$('#s-vraag'), oms=$('#oms-label'), startVeld=$('#veld-start');
    var zetSoort=function(s){soort=s;knopO.setAttribute('aria-pressed',s==='offerte'?'true':'false');knopV.setAttribute('aria-pressed',s==='vraag'?'true':'false');oms.textContent=s==='offerte'?'Wat moet er gebeuren?':'Wat is uw vraag?';startVeld.hidden=(s!=='offerte')};
    knopO.addEventListener('click',function(){zetSoort('offerte')});knopV.addEventListener('click',function(){zetSoort('vraag')});
    var chips=$$('#chips button');
    var zetDienst=function(v){dienst=v;chips.forEach(function(c){c.setAttribute('aria-pressed',c.getAttribute('data-waarde')===v?'true':'false')})};
    chips.forEach(function(c){c.addEventListener('click',function(){var v=c.getAttribute('data-waarde');zetDienst(dienst===v?'':v)})});
    ['naam','tel'].forEach(function(k){f[k].addEventListener('input',function(){f[k].closest('.veld').classList.remove('mis')})});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true;['naam','tel'].forEach(function(k){if(!f[k].value.trim()){f[k].closest('.veld').classList.add('mis');ok=false}});
      if(!ok){(f.naam.value.trim()?f.tel:f.naam).focus();return}
      var r=['Goedendag, '+(soort==='offerte'?'ik wil graag een prijsopgave.':'ik heb een vraag.')];
      if(dienst)r.push('Soort werk: '+dienst);
      r.push('Naam: '+f.naam.value.trim());r.push('Telefoon: '+f.tel.value.trim());
      if(f.plaats.value.trim())r.push('Postcode of plaats: '+f.plaats.value.trim());
      if(f.oms.value.trim())r.push((soort==='offerte'?'Wat er moet gebeuren: ':'Vraag: ')+f.oms.value.trim());
      if(soort==='offerte'&&f.start.value.trim())r.push('Gewenste start: '+f.start.value.trim());
      var tekst=r.join('\n');
      if(KANAAL==='whatsapp'&&NUM){w.open('https://wa.me/'+NUM+'?text='+encodeURIComponent(tekst),'_blank','noopener');return}
      var ond=(soort==='offerte'?'Prijsopgave':'Vraag')+(dienst?': '+dienst:'');
      w.location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(ond)+'&body='+encodeURIComponent(tekst);
    });
    /* CTA's vullen het formulier vooraf in */
    var vul=function(s,dn){zetSoort(s==='vraag'?'vraag':'offerte');if(dn){var c=chips.filter(function(c){return c.getAttribute('data-sleutel')===dn})[0];if(c)zetDienst(c.getAttribute('data-waarde'))}else{zetDienst('')}};
    $$('[data-soort]').forEach(function(a){a.addEventListener('click',function(){vul(a.getAttribute('data-soort'),a.getAttribute('data-dienst'))})});
    var q=new URLSearchParams(w.location.search);if(q.get('soort')||q.get('dienst'))vul(q.get('soort')||'offerte',q.get('dienst'));
  }
})();
