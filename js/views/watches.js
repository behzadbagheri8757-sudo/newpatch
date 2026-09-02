/* js/views/watches.js — SPA Watch List + Watch Detail (UX patch).
   Presentation/navigation layer only. Reads existing Watch data via the
   existing public Watch Lifecycle API (getActiveWatchOccurrences,
   reconcileWatchLifecycle, watchReasonLabel). Does NOT generate, score,
   or resolve Watches, and does NOT duplicate js/views/customer.js's
   per-customer Watch reason-recording UI.
*/
'use strict';

(function (global) {

  /* ---------- shared helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function watchesHref() {
    return '#/watches';
  }

  function watchDetailHref(occId) {
    return '#/watch?id=' + encodeURIComponent(occId || '');
  }

  function navigateToWatch(occId) {
    if (
      typeof isSpaShell === 'function' &&
      isSpaShell() &&
      typeof AppRouter !== 'undefined' &&
      AppRouter.navigate
    ) {
      AppRouter.navigate('/watch', { id: occId });
    } else {
      location.href = watchDetailHref(occId);
    }
  }

  function navigateToWatches() {
    if (
      typeof isSpaShell === 'function' &&
      isSpaShell() &&
      typeof AppRouter !== 'undefined' &&
      AppRouter.navigate
    ) {
      AppRouter.navigate('/watches');
    } else {
      location.href = watchesHref();
    }
  }

  function customerNameById(cid) {
    if (typeof data === 'undefined' || !Array.isArray(data.customers)) return '—';
    var c = data.customers.find(function (x) { return x && x.id === cid; });
    return (c && c.name) ? c.name : '—';
  }

  function productNameForOccurrence(o) {
    if (!o) return null;
    if (o.productName) return o.productName;
    if (o.productId && typeof data !== 'undefined' && Array.isArray(data.products)) {
      var p = data.products.find(function (x) { return x && x.id === o.productId; });
      if (p && p.name) return p.name;
    }
    return null;
  }

  /* Existing stored severity only — never recalculated. */
  function levelLabel(level) {
    return level === 'high' ? 'زیاد' : level === 'medium' ? 'متوسط' : level === 'low' ? 'کم' : (level || '—');
  }
  function levelColor(level) {
    return level === 'high' ? '#B3261E' : level === 'medium' ? '#C77700' : '#6B7280';
  }

  /* Local presentational label only (UI text), not a business rule.
     Falls back to the raw stored category string for anything unmapped,
     so no meaning is invented for codes not listed here. */
  function categoryLabel(cat) {
    switch (cat) {
      case 'SKU_DELAY':
      case 'SKU_DELAY_WATCH':
        return 'تأخیر خرید کالا';
      case 'SKU_QUANTITY_DROP':
      case 'SKU_QUANTITY_DROP_WATCH':
        return 'کاهش مقدار خرید';
      case 'SKU_FREQUENCY_DROP':
      case 'SKU_FREQUENCY_DROP_WATCH':
        return 'کاهش تناوب خرید';
      case 'LINE_DROP':
      case 'LINE_DROP_WATCH':
        return 'حذف خط محصول';
      case 'MULTI_SKU_DECLINE':
      case 'COMBINED_SKU_WATCH':
        return 'تضعیف چند کالا';
      default:
        return cat || '—';
    }
  }

  /* ---------- WatchesView (list) ---------- */

  var listRootEl = null;
  var listClickHandler = null;

  function renderWatchList(root) {
    if (!root) return;

    var occs = [];
    if (typeof getActiveWatchOccurrences === 'function') {
      try { occs = getActiveWatchOccurrences() || []; } catch (e) { occs = []; }
    }

    if (!occs.length) {
      root.innerHTML =
        '<h2 class="section-title">هشدارهای فعال (Watch)</h2>' +
        '<div class="empty">هشدار فعالی نیست</div>';
      return;
    }

    var rows = occs.map(function (o) {
      var custName = customerNameById(o.customerId);
      var prodName = productNameForOccurrence(o);
      var catLabel = categoryLabel(o.watchCategory);
      var sub = [prodName ? ('«' + esc(prodName) + '»') : null, esc(catLabel)].filter(Boolean).join(' — ');
      var reviewed = !!(o.reason);
      var reviewBadge = reviewed
        ? '<span class="watch-reviewed-badge is-reviewed">بررسی شده</span>'
        : '<span class="watch-reviewed-badge">بررسی نشده</span>';
      return '<a class="ledger-row watch-list-row" data-watch-id="' + esc(o.id) + '" href="' + watchDetailHref(o.id) + '">' +
        '<span class="name">' + esc(custName) + '<span class="sub">' + sub + '</span></span>' +
        '<span class="filler"></span>' +
        '<span class="amount watch-list-amount">' +
          reviewBadge +
          '<span class="watch-severity-badge" style="color:' + levelColor(o.level) + ';">' + esc(levelLabel(o.level)) + '</span>' +
        '</span>' +
      '</a>';
    }).join('');

    root.innerHTML =
      '<h2 class="section-title">هشدارهای فعال (Watch)</h2>' +
      '<div class="report-note" style="margin-bottom:10px;">' + occs.length + ' هشدار فعال</div>' +
      '<div id="watch-list-rows">' + rows + '</div>';

    if (listClickHandler) {
      root.removeEventListener('click', listClickHandler);
    }
    listClickHandler = function (e) {
      var row = e.target.closest('[data-watch-id]');
      if (!row) return;
      e.preventDefault();
      navigateToWatch(row.getAttribute('data-watch-id'));
    };
    root.addEventListener('click', listClickHandler);
  }

  function watchesMount(root, params) {
    if (!root) return function () {};
    listRootEl = root;
    var cancelled = false;

    var nav = document.getElementById('nav');
    if (nav) nav.style.display = '';

    function refresh() {
      if (cancelled) return;
      renderWatchList(root);
    }

    // Reconcile first (existing lifecycle logic; fail-open) so a direct
    // deep link to #/watches shows current data, same as the Dashboard does.
    if (typeof reconcileWatchLifecycle === 'function') {
      reconcileWatchLifecycle().then(refresh).catch(function (e) {
        console.warn('watch lifecycle reconcile failed', e);
        refresh();
      });
    } else {
      refresh();
    }

    var refreshToken = (typeof ViewHost !== 'undefined' && ViewHost.setRefresh) ? ViewHost.setRefresh(refresh) : null;

    return function unmount() {
      cancelled = true;
      if (typeof ViewHost !== 'undefined' && ViewHost.clearRefresh) ViewHost.clearRefresh(refreshToken);
      if (listClickHandler) {
        root.removeEventListener('click', listClickHandler);
        listClickHandler = null;
      }
      root.innerHTML = '';
      listRootEl = null;
    };
  }

  global.WatchesView = { mount: watchesMount, unmount: function () {} };

  /* ---------- WatchDetailView ---------- */

  var detailRootEl = null;
  var detailOccId = null;

  /* Public-API-only lookup: getActiveWatchOccurrences() has no id filter,
     so we search the full active list. (There is no getOccurrenceById in
     the existing public API, and private Lifecycle state is out of scope.) */
  function findActiveOccurrence(id) {
    if (!id || typeof getActiveWatchOccurrences !== 'function') return null;
    var occs = [];
    try { occs = getActiveWatchOccurrences() || []; } catch (e) { occs = []; }
    for (var i = 0; i < occs.length; i++) {
      if (occs[i] && occs[i].id === id) return occs[i];
    }
    return null;
  }

  function renderWatchDetail(root, id) {
    if (!root) return;

    var occ;
    try {
      occ = findActiveOccurrence(id);
    } catch (e) {
      occ = null;
    }

    if (!id || !occ) {
      root.innerHTML =
        '<h2 class="section-title">جزئیات هشدار</h2>' +
        '<div class="empty">این هشدار پیدا نشد یا دیگر فعال نیست.</div>' +
        '<div class="btn-row"><a class="btn secondary" href="' + watchesHref() + '">بازگشت به لیست</a></div>';
      return;
    }

    var custName = customerNameById(occ.customerId);
    var prodName = productNameForOccurrence(occ);
    var catLabel = categoryLabel(occ.watchCategory);

    var reasonBlock = '';
    if (occ.reason) {
      var rlabel = (typeof watchReasonLabel === 'function') ? watchReasonLabel(occ.reason.code) : (occ.reason.code || '');
      reasonBlock =
        '<div class="watch-detail-block">' +
          '<div class="label">علت ثبت‌شده توسط فروشنده</div>' +
          '<div class="watch-detail-value">' + esc(rlabel) + (occ.reason.comment ? (' — ' + esc(occ.reason.comment)) : '') + '</div>' +
        '</div>';
    }

    var resolutionBlock = '';
    if (occ.resolution) {
      resolutionBlock =
        '<div class="watch-detail-block">' +
          '<div class="label">وضعیت</div>' +
          '<div class="watch-detail-value">' + esc(occ.resolution.note || occ.resolution.type || '—') + '</div>' +
        '</div>';
    }

    root.innerHTML =
      '<h2 class="section-title">جزئیات هشدار</h2>' +
      '<div class="card wide watch-detail-card">' +
        '<div class="watch-detail-head">' +
          '<a class="name" data-watch-open-customer="' + esc(occ.customerId) + '" href="#/customer?id=' + encodeURIComponent(occ.customerId || '') + '">' + esc(custName) + '</a>' +
          '<span class="watch-severity-badge" style="color:' + levelColor(occ.level) + ';">' + esc(levelLabel(occ.level)) + '</span>' +
        '</div>' +
        (prodName ? '<div class="watch-detail-block"><div class="label">محصول</div><div class="watch-detail-value">' + esc(prodName) + '</div></div>' : '') +
        '<div class="watch-detail-block"><div class="label">دسته هشدار</div><div class="watch-detail-value">' + esc(catLabel) + '</div></div>' +
        '<div class="watch-detail-block watch-detail-reason">' +
          '<div class="label">چرا این هشدار؟</div>' +
          '<div class="watch-detail-value">' + esc(occ.generatedReason || '—') + '</div>' +
        '</div>' +
        reasonBlock +
        resolutionBlock +
      '</div>' +
      '<div class="btn-row"><a class="btn secondary" href="' + watchesHref() + '">بازگشت به لیست</a></div>';
  }

  function watchDetailMount(root, params) {
    if (!root) return function () {};
    detailRootEl = root;
    detailOccId = params && params.id ? params.id : null;
    var cancelled = false;

    var nav = document.getElementById('nav');
    if (nav) nav.style.display = '';

    function refresh() {
      if (cancelled) return;
      renderWatchDetail(root, detailOccId);
    }

    if (typeof reconcileWatchLifecycle === 'function') {
      reconcileWatchLifecycle().then(refresh).catch(function (e) {
        console.warn('watch lifecycle reconcile failed', e);
        refresh();
      });
    } else {
      refresh();
    }

    var refreshToken = (typeof ViewHost !== 'undefined' && ViewHost.setRefresh) ? ViewHost.setRefresh(refresh) : null;

    return function unmount() {
      cancelled = true;
      if (typeof ViewHost !== 'undefined' && ViewHost.clearRefresh) ViewHost.clearRefresh(refreshToken);
      root.innerHTML = '';
      detailRootEl = null;
      detailOccId = null;
    };
  }

  global.WatchDetailView = { mount: watchDetailMount, unmount: function () {} };

})(typeof window !== 'undefined' ? window : this);
