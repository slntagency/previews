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

  /* Parallax: de portretten in het dubbelraam (binnen hun kader) en de raamkruizen achter de tint-secties.
     Alleen transform, maximaal 24 px (portret) of 40 px (raamkruis). Nooit op kaarten. */
  var px=$$('[data-px]'), dp=$$('[data-dpx]');
  if((px.length||dp.length)&&!rm){
    var tik=false;
    var mid=function(el){var r=el.getBoundingClientRect();return r.top+r.height/2-w.innerHeight/2};
    var doe=function(){
      px.forEach(function(el){var y=Math.max(-24,Math.min(24,-mid(el)*parseFloat(el.getAttribute('data-px'))));el.style.transform='translateY('+y.toFixed(1)+'px) scale(1.08)'});
      dp.forEach(function(el){var y=Math.max(-40,Math.min(40,-mid(el)*parseFloat(el.getAttribute('data-dpx'))));el.style.transform='translateY('+y.toFixed(1)+'px)'});
      tik=false};
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

  /* Werkwijze: op mobiel vult de lijn rood tijdens het scrollen en lichten de stappen op */
  var st=$('.raam4');
  if(st){
    var stp=$$('.stap',st);
    if(rm){stp.forEach(function(s){s.classList.add('aan')});st.style.setProperty('--vul','1')}
    else{
      var loop=function(){var lr=st.getBoundingClientRect();var q=Math.max(0,Math.min(1,(w.innerHeight*.6-lr.top)/lr.height));st.style.setProperty('--vul',q.toFixed(3));stp.forEach(function(s){s.classList.toggle('aan',s.getBoundingClientRect().top<w.innerHeight*.6)})};
      w.addEventListener('scroll',function(){requestAnimationFrame(loop)},{passive:true});w.addEventListener('resize',loop);loop();
    }
  }

  /* Formulier: opent een ingevuld e-mailbericht. Glas gaat naar glas@, bouw naar bouw@. Er wordt niets vanzelf verstuurd.
     WhatsApp: de knop op de huidige site heeft een onvolledig nummer, een werkend nummer staat niet in het feitenblad.
     Komt er een WhatsApp-nummer: zet KANAAL op 'whatsapp' en vul NUM in (bijv. 31612345678). */
  var f=$('#berichtform');
  if(f){
    var KANAAL='mail', NUM='', MAIL={glas:'glas@gebroedersjansentotaal.nl',bouw:'bouw@gebroedersjansentotaal.nl'};
    var soort='offerte', dienst='', spoor='glas';
    var knopO=$('#s-offerte'), knopV=$('#s-vraag'), oms=$('#oms-label'), startVeld=$('#veld-start');
    var zetSoort=function(s){soort=s;knopO.setAttribute('aria-pressed',s==='offerte'?'true':'false');knopV.setAttribute('aria-pressed',s==='vraag'?'true':'false');oms.textContent=s==='offerte'?'Wat moet er gebeuren?':'Wat is uw vraag?';startVeld.hidden=(s!=='offerte')};
    knopO.addEventListener('click',function(){zetSoort('offerte')});knopV.addEventListener('click',function(){zetSoort('vraag')});
    var chips=$$('#chips button');
    var zetDienst=function(v){dienst=v;spoor='glas';chips.forEach(function(c){var aan=c.getAttribute('data-waarde')===v;c.setAttribute('aria-pressed',aan?'true':'false');if(aan)spoor=c.getAttribute('data-spoor')})};
    chips.forEach(function(c){c.addEventListener('click',function(){var v=c.getAttribute('data-waarde');zetDienst(dienst===v?'':v)})});
    ['naam','tel'].forEach(function(k){f[k].addEventListener('input',function(){f[k].closest('.veld').classList.remove('mis')})});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true;['naam','tel'].forEach(function(k){if(!f[k].value.trim()){f[k].closest('.veld').classList.add('mis');ok=false}});
      if(!ok){(f.naam.value.trim()?f.tel:f.naam).focus();return}
      var r=['Beste Gebroeders Jansen, '+(soort==='offerte'?'ik wil graag een offerte aanvragen.':'ik heb een vraag.')];
      if(dienst)r.push('Waar het om gaat: '+dienst);
      r.push('Naam: '+f.naam.value.trim());r.push('Telefoon: '+f.tel.value.trim());
      if(f.plaats.value.trim())r.push('Postcode of woonplaats: '+f.plaats.value.trim());
      if(f.ruiten.value.trim())r.push('Aantal ruiten: '+f.ruiten.value.trim());
      if(f.oms.value.trim())r.push((soort==='offerte'?'Wat er moet gebeuren: ':'Vraag: ')+f.oms.value.trim());
      if(soort==='offerte'&&f.start.value.trim())r.push('Gewenste periode: '+f.start.value.trim());
      var tekst=r.join('\n');
      if(KANAAL==='whatsapp'&&NUM){w.open('https://wa.me/'+NUM+'?text='+encodeURIComponent(tekst+'\n(Foto’s stuur ik hierna mee.)'),'_blank','noopener')}
      else{var ond=(soort==='offerte'?'Offerteaanvraag':'Vraag')+(dienst?': '+dienst:'');w.location.href='mailto:'+MAIL[spoor]+'?subject='+encodeURIComponent(ond)+'&body='+encodeURIComponent(tekst+'\n\n(Foto’s voeg ik als bijlage toe.)')}
    });
    /* CTA's vullen het formulier vooraf in */
    var vul=function(s,dn){zetSoort(s==='vraag'?'vraag':'offerte');if(dn){var c=chips.filter(function(c){return c.getAttribute('data-sleutel')===dn})[0];if(c)zetDienst(c.getAttribute('data-waarde'))}else{zetDienst('')}};
    $$('[data-soort]').forEach(function(a){a.addEventListener('click',function(){vul(a.getAttribute('data-soort'),a.getAttribute('data-dienst'))})});
    var q=new URLSearchParams(w.location.search);if(q.get('soort')||q.get('dienst'))vul(q.get('soort')||'offerte',q.get('dienst'));
  }
})();
