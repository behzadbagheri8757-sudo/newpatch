/* js/reason_codes.js — Customer × SKU purchase-miss Reason Codes
   Additive subsystem. No financial/accounting mutations.
   Stores structured reasons in data.reasonCodes so normal CRM backup/restore
   carries them automatically.
*/
'use strict';
(function(global){
  var MAX_DAILY_PROMPTS = 5;
  var COOLDOWN_DAYS = 30;
  var REASON_RULES = {
    competitor_bought: { label:'از رقیب خرید', cooldown:14, action:'پیشنهاد رقابتی در پیگیری بعدی' },
    price_high:        { label:'قیمت بالا', cooldown:7,  action:'بررسی حساسیت قیمتی مشتری' },
    stockout:          { label:'موجودی ندارد', cooldown:9,  action:'بررسی تأمین/موجودی' },
    quality:           { label:'کیفیت', cooldown:30, action:'پیگیری کیفیت' },
    no_demand:        { label:'عدم تقاضا', cooldown:21, action:'کاهش موقت اولویت پیشنهاد' },
    other:             { label:'سایر', cooldown:14, action:'پیگیری در ویزیت بعدی' },
    dismissed:         { label:'رد شد', cooldown:7,  action:'بدون اقدام' }
  };

  function _today(){ return typeof todayISO==='function' ? todayISO() : new Date().toISOString().slice(0,10); }
  function _now(){ return new Date().toISOString(); }
  function _uid(){ return 'rc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }
  function _dateDiff(a,b){
    if(!a || !b) return null;
    var x = new Date(String(a).slice(0,10)).getTime(), y = new Date(String(b).slice(0,10)).getTime();
    if(isNaN(x)||isNaN(y)) return null;
    return Math.floor((x-y)/86400000);
  }
  function _records(){
    if(typeof data==='undefined' || !data) return [];
    if(!Array.isArray(data.reasonCodes)) data.reasonCodes=[];
    return data.reasonCodes;
  }
  function _sellerId(){
    if(typeof data!=='undefined' && data && data.settings && data.settings.sellerId) return String(data.settings.sellerId);
    return 'default';
  }
  function _productName(pid){
    if(typeof data==='undefined' || !Array.isArray(data.products)) return pid||'';
    var p=data.products.find(function(x){return x&&x.id===pid;});
    return p&&p.name ? p.name : (pid||'');
  }
  function _customerInvoices(cid){
    return (typeof customerInvoices==='function') ? customerInvoices(cid) : (data.invoices||[]).filter(function(i){return i.customerId===cid;});
  }
  function _productPurchases(cid,pid){
    var out=[];
    _customerInvoices(cid).forEach(function(inv){
      (inv.items||[]).forEach(function(it){
        if(it && it.productId===pid && Number(it.qty)>0) out.push({date:inv.date,qty:Number(it.qty)});
      });
    });
    out.sort(function(a,b){return String(a.date||'').localeCompare(String(b.date||''));});
    return out;
  }
  function _median(a){ if(!a.length) return null; var s=a.slice().sort(function(x,y){return x-y;}),m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; }

  function _regularMissingCandidates(cid, asOfDate){
    var invs=_customerInvoices(cid).slice().sort(function(a,b){return String(a.date||'').localeCompare(String(b.date||''));});
    if(invs.length<3) return [];
    var pids=Object.create(null);
    invs.forEach(function(inv){(inv.items||[]).forEach(function(it){if(it&&it.productId&&Number(it.qty)>0)pids[it.productId]=true;});});
    var out=[];
    Object.keys(pids).forEach(function(pid){
      var purchases=_productPurchases(cid,pid);
      if(purchases.length<3) return;
      var last=purchases[purchases.length-1];
      var prev=purchases.slice(-4,-1);
      if(prev.length<2) return;
      var intervals=[];
      for(var i=1;i<purchases.length;i++){
        var d=_dateDiff(purchases[i].date,purchases[i-1].date);
        if(d!=null&&d>0) intervals.push(d);
      }
      if(intervals.length<2) return;
      var cycle=_median(intervals);
      if(!(cycle>0)) return;
      var last3=purchases.slice(-3).map(function(x){return x.qty;});
      var qmean=last3.reduce(function(s,x){return s+x;},0)/last3.length;
      var qdev=qmean>0 ? (Math.max.apply(null,last3)-Math.min.apply(null,last3))/qmean : 1;
      if(qdev>=0.20) return;
      var gap=_dateDiff(asOfDate,last.date);
      if(gap==null || gap<=cycle*1.5) return;
      var recentReason=_records().filter(function(r){
        return r.customerId===cid && r.productId===pid && r.type==='response' && r.reasonCode!=='dismissed';
      }).sort(function(a,b){return String(b.timestamp||'').localeCompare(String(a.timestamp||''));})[0];
      if(recentReason){
        var cd=REASON_RULES[recentReason.reasonCode] ? REASON_RULES[recentReason.reasonCode].cooldown : COOLDOWN_DAYS;
        var age=_dateDiff(asOfDate,String(recentReason.timestamp||'').slice(0,10));
        if(age!=null && age>=0 && age<cd) return;
      }
      var lastShown=_records().filter(function(r){return r.customerId===cid&&r.productId===pid&&r.type==='prompt';})
        .sort(function(a,b){return String(b.timestamp||'').localeCompare(String(a.timestamp||''));})[0];
      if(lastShown){
        var shownAge=_dateDiff(asOfDate,String(lastShown.timestamp||'').slice(0,10));
        if(shownAge!=null && shownAge<COOLDOWN_DAYS) return;
      }
      out.push({customerId:cid,productId:pid,productName:_productName(pid),lastPurchaseDate:last.date,lastPurchaseQty:last.qty,typicalCycle:cycle,gap:gap,quantityDeviation:qdev});
    });
    return out;
  }

  function dailyPromptCount(asOfDate){
    return _records().filter(function(r){return r.type==='prompt'&&String(r.timestamp||'').slice(0,10)===asOfDate;}).length;
  }
  function getMissingItemsForOrder(cid,asOfDate){
    if(!cid || dailyPromptCount(asOfDate||_today())>=MAX_DAILY_PROMPTS) return [];
    return _regularMissingCandidates(cid,asOfDate||_today()).slice(0,MAX_DAILY_PROMPTS-dailyPromptCount(asOfDate||_today()));
  }
  function markPromptShown(candidate, point){
    if(!candidate) return null;
    var rec={id:_uid(),type:'prompt',point:point||'order_entry',timestamp:_now(),customerId:candidate.customerId,productId:candidate.productId,productName:candidate.productName,sellerId:_sellerId()};
    _records().push(rec);
    return rec;
  }
  function recordReasonCode(customerId,productId,reasonCode,otherText,point,extra){
    if(!REASON_RULES[reasonCode]) reasonCode='other';
    var rec={id:_uid(),type:'response',timestamp:_now(),customerId:customerId,productId:productId,productName:_productName(productId),sellerId:_sellerId(),reasonCode:reasonCode,point:point||'order_entry'};
    if(otherText) rec.otherText=String(otherText).slice(0,50);
    if(extra && extra.invoiceId) rec.invoiceId=extra.invoiceId;
    if(extra && extra.visitId) rec.visitId=extra.visitId;
    _records().push(rec);
    // Feed existing seller-feedback loop where an established equivalent exists.
    if(typeof recordFeedback==='function' && reasonCode==='competitor_bought'){
      try{ recordFeedback(customerId,productId,'SKU_MISSING', 'competitor_bought', otherText||''); }catch(e){}
    }
    return rec;
  }
  function recordDismiss(candidate,point){ return recordReasonCode(candidate.customerId,candidate.productId,'dismissed','',point); }
  function getRecentReason(customerId,productId){
    var a=_records().filter(function(r){return r.type==='response'&&r.customerId===customerId&&r.productId===productId;}).sort(function(x,y){return String(y.timestamp||'').localeCompare(String(x.timestamp||''));});
    return a[0]||null;
  }
  function getReasonContext(customerId,productId,asOfDate){
    var r=getRecentReason(customerId,productId); if(!r) return null;
    var rule=REASON_RULES[r.reasonCode]||REASON_RULES.other;
    var age=_dateDiff(asOfDate||_today(),String(r.timestamp||'').slice(0,10));
    if(age==null || age<0 || age>=rule.cooldown) return null;
    return {reasonCode:r.reasonCode,ageDays:age,cooldownDays:rule.cooldown,action:rule.action,record:r};
  }
  function getNextBestAction(customerId,productId){
    var ctx=getReasonContext(customerId,productId,_today());
    return ctx ? ctx.action : null;
  }
  function renderMissingItemsHtml(candidates,point){
    if(!candidates||!candidates.length) return '';
    return '<div class="section-title" style="margin-top:12px;">موارد جاافتاده</div>'+
      '<div class="reason-code-box" style="background:#fff8df;border:1px solid #ead79b;border-radius:12px;padding:10px;margin-bottom:12px;">'+
      '<div style="font-size:.8rem;margin-bottom:8px;">کالاهایی که طبق الگوی خرید مشتری انتظار می‌رفت در این ویزیت دیده شوند:</div>'+
      candidates.map(function(c){return '<div class="reason-card" data-reason-pid="'+esc(c.productId)+'" data-reason-point="'+esc(point||'order_entry')+'" style="padding:8px 0;border-top:1px solid rgba(0,0,0,.08);">'+
        '<div style="font-weight:700;">⚠️ '+esc(c.productName)+'</div><div style="font-size:.72rem;opacity:.8;margin:3px 0 6px;">آخرین خرید: '+esc(typeof faDate==='function'?faDate(c.lastPurchaseDate):c.lastPurchaseDate||'—')+' — الگو: حدود هر '+Math.round(c.typicalCycle)+' روز</div>'+ 
        '<div class="chip-row reason-options">'+Object.keys(REASON_RULES).filter(function(k){return k!=='dismissed';}).map(function(k){return '<button type="button" class="chip reason-option" data-reason="'+k+'">'+REASON_RULES[k].label+'</button>';}).join('')+'<button type="button" class="chip reason-dismiss" data-reason="dismissed">رد کردن</button></div>'+ 
        '<div class="reason-other" hidden style="margin-top:6px;"><input maxlength="50" data-reason-other placeholder="سایر (حداکثر ۵۰ کاراکتر)"></div></div>';}).join('')+'</div>';
  }
  global.ReasonCodes={MAX_DAILY_PROMPTS:MAX_DAILY_PROMPTS,REASON_RULES:REASON_RULES,getMissingItemsForOrder:getMissingItemsForOrder,markPromptShown:markPromptShown,recordReasonCode:recordReasonCode,recordDismiss:recordDismiss,getReasonContext:getReasonContext,getNextBestAction:getNextBestAction,renderMissingItemsHtml:renderMissingItemsHtml};
})(window);
