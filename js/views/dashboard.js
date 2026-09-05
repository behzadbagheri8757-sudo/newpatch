/* js/views/dashboard.js — Daily Command Center
   UI/derived metrics only. Existing accounting logic remains authoritative.
*/
'use strict';

(function (global) {
  const ICO = {
    invoice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 7l1 0"/><path d="M9 13l6 0"/><path d="M13 17l2 0"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"/><path d="M12 12l8 -4.5"/><path d="M12 12l0 9"/><path d="M12 12l-8 -4.5"/><path d="M16 5.25l-8 4.5"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"/><path d="M3 10l18 0"/><path d="M7 15l.01 0"/><path d="M11 15l2 0"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l18 0"/><path d="M3 10l18 0"/><path d="M5 6l7 -3l7 3"/><path d="M4 10l0 11"/><path d="M20 10l0 11"/><path d="M8 14l0 3"/><path d="M12 14l0 3"/><path d="M16 14l0 3"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M4 20h14"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/></svg>',
    warehouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21v-13l9 -4l9 4v13"/><path d="M13 13h4v8h-10v-6h6"/><path d="M13 21v-9a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v3"/></svg>',
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l18 0"/><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4"/><path d="M5 21l0 -10.15"/><path d="M19 21l0 -10.15"/><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4"/></svg>',
    /* Monthly sales target FAB — Tabler target-arrow; button stays 42px via CSS */
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3 -3h-3v-3z"/><path d="M15 9l-3 3"/></svg>',
    /* Sales growth in monthly-target box — Tabler trending-up; gold via CSS */
    growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6 -6l4 4l8 -8"/><path d="M14 7l7 0l0 7"/></svg>',
    /* NEW: Sales Game / Game Center entry */
    game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21l8 0"/><path d="M12 17l0 4"/><path d="M7 4l10 0"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/></svg>'
  };

  // Tabler-style semantic section icons; all dashboard icons share the same stroke language.
  ICO.actions = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h-2a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10a2 2 0 0 0 -2 -2h-2"/><path d="M9 5a3 3 0 0 1 6 0"/><path d="M9 12l2 2l4 -4"/></svg>';
  ICO.summary = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19v-8a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8"/><path d="M10 19v-13a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v13"/><path d="M16 19v-5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v5"/><path d="M3 19h18"/></svg>';
  ICO.quick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/></svg>';
  ICO.invoiceSection = ICO.invoice;
  ICO.visitSection = ICO.map;

  function dashSectionHead(ico, title, href, action, badge) {
    return '<div class="dashboard-block-head"><div class="dash-section-label"><span class="dash-section-ico" aria-hidden="true">' + ico + '</span><span>' + title + '</span>' + (badge || '') + '</div>' + (href ? '<a class="section-action" href="' + href + '">' + action + '</a>' : '') + '</div>';
  }

  /* Urgency icons: Tabler-style, priority semantics only (not growth/decline).
     stroke ~1.7 matches existing ICO.* set on this page. */
  const ACTION_URGENCY_ICON = {
    critical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/></svg>',
    high: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.075 -3.826 -1.5 -4.5c.25 1.53.25 2.5 -1 3.5"/></svg>',
    medium: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/></svg>',
    low: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/></svg>'
  };

  function normalizeDigits(v) {
    return String(v || '').replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)); });
  }

  function money(v) { return toman(Math.round(Number(v) || 0)) + ' ت'; }

  function deltaHtml(pct) {
    if (pct === null || pct === undefined || !isFinite(pct)) return '<span class="kpi-delta flat">بدون مقایسه</span>';
    const n = Math.round(pct * 10) / 10;
    if (n > 0) return '<span class="kpi-delta up">↑ ' + esc(String(n).replace('-', '')) + '٪</span> <span>نسبت به بازه مشابه</span>';
    if (n < 0) return '<span class="kpi-delta down">↓ ' + esc(String(Math.abs(n))) + '٪</span> <span>نسبت به بازه مشابه</span>';
    return '<span class="kpi-delta flat">۰٪</span> <span>بدون تغییر</span>';
  }

  function dashTile(href, ico, title, sub) {
    return '<a class="dash-tile" href="' + href + '"><span class="dash-ico">' + ico + '</span><span class="dash-title">' + title + '</span>' + (sub ? '<span class="dash-sub">' + sub + '</span>' : '') + '</a>';
  }

  /* Quick Actions: opens a tiny customer picker, then delegates to the existing
     global add-* functions (openAddInvoice/openAddTransaction/openAddVisit).
     No new business logic — same pattern as invoices.js's openNewInvoicePicker. */
  function quickActionPickCustomer(title, fn) {
    if (typeof openSearchableCustomerPicker === 'function') {
      openSearchableCustomerPicker({
        title: title,
        onPick: function (cid) { if (typeof fn === 'function') fn(cid); }
      });
      return;
    }
    // Fallback (should not hit in production SPA)
    if (!data.customers || !data.customers.length) {
      if (typeof openSheet === 'function') {
        openSheet('<h3>مشتری ندارید</h3><div class="empty">اول از بخش مشتریان، یک مشتری ثبت کنید.</div>' +
          '<div class="btn-row"><a class="btn secondary" href="#/customers">رفتن به مشتریان</a></div>');
      }
      return;
    }
    const opts = data.customers.slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || '', 'fa'); })
      .map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('');
    openSheet(
      '<h3>' + esc(title) + '</h3>' +
      '<div class="field"><label>مشتری</label><select id="qa-pick-customer">' + opts + '</select></div>' +
      '<div class="btn-row"><button class="btn" id="qa-pick-go">ادامه</button></div>'
    );
    const goBtn = document.getElementById('qa-pick-go');
    if (goBtn) goBtn.onclick = function () {
      const cid = document.getElementById('qa-pick-customer').value;
      closeModal();
      if (typeof fn === 'function') fn(cid);
    };
  }

  function quickActionsHtml() {
    return '<section class="cc-block">' +
      '<div class="cc-block-head"><div class="cc-block-label">اقدام سریع</div>' +
        '<a class="cc-block-link" href="#/game">Sales Game</a></div>' +
      '<div class="cc-toolbar dash-quick-actions">' +
        '<button type="button" class="cc-tool" data-qa="invoice"><span class="cc-tool-ico" aria-hidden="true">' + ICO.invoice + '</span><span class="cc-tool-label">فاکتور</span></button>' +
        '<button type="button" class="cc-tool" data-qa="payment"><span class="cc-tool-ico" aria-hidden="true">' + ICO.card + '</span><span class="cc-tool-label">دریافت</span></button>' +
        '<button type="button" class="cc-tool" data-qa="visit"><span class="cc-tool-ico" aria-hidden="true">' + ICO.map + '</span><span class="cc-tool-label">ویزیت</span></button>' +
        '<a class="cc-tool" href="#/evaluation"><span class="cc-tool-ico" aria-hidden="true">' + ICO.shop + '</span><span class="cc-tool-label">ارزیابی</span></a>' +
      '</div></section>';
  }

  function bindQuickActions(root) {
    const wrap = root.querySelector('.dash-quick-actions');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-qa]');
      if (!btn) return;
      const kind = btn.getAttribute('data-qa');
      if (kind === 'invoice') quickActionPickCustomer('فاکتور جدید — انتخاب مشتری', function (cid) { if (typeof openAddInvoice === 'function') openAddInvoice(cid); });
      else if (kind === 'payment') quickActionPickCustomer('ثبت دریافت — انتخاب مشتری', function (cid) { if (typeof openAddTransaction === 'function') openAddTransaction(cid); });
      else if (kind === 'visit') quickActionPickCustomer('ثبت ویزیت — انتخاب مشتری', function (cid) { if (typeof openAddVisit === 'function') openAddVisit(cid); });
    });
  }


  /* «کارهای پیشنهادی امروز» — pure UI read of the existing Action Engine.
     No decision logic here: sorting, urgency, action text and reason all
     come from calculateAllCustomerActions() as-is. This function only
     looks up the customer's name (read-only) and renders the existing
     dashboard-block/ledger-row markup used elsewhere on this page. */
  function todaysActionsHtml() {
    // Prefer unified queue; fall back to legacy customer-only actions.
    let items = [];
    try {
      if (typeof calculateAllActions === 'function') {
        items = (calculateAllActions() || []).filter(function (a) {
          return a && a.actionType !== 'no_action';
        });
      } else if (typeof calculateAllCustomerActions === 'function') {
        items = (calculateAllCustomerActions() || []).filter(function (a) {
          return a && a.actionType !== 'no_action';
        });
      }
    } catch (e) { return ''; }
    if (!items.length) {
      return '<section class="cc-block">' +
        '<div class="cc-block-label">اقدام بعدی</div>' +
        '<div class="cc-task-list"><div class="cc-empty">امروز کار ضروری نداری<br><span class="cc-empty-sub">وضعیت تحت کنترل است</span></div></div></section>';
    }

    // Max Top 5 by unifiedScore (already sorted by calculateAllActions)
    items = items.slice(0, 5);

    const visibleItems = items.slice(0, 2);
    const hiddenItems = items.slice(2);

    function renderRow(a) {
      const isProspect = a.type === 'prospect';
      const name = a.name || (function () {
        if (a.customerId && typeof data !== 'undefined') {
          const cust = (data.customers || []).find(function (c) { return c.id === a.customerId; });
          return cust ? cust.name : '—';
        }
        return '—';
      })();
      const badge = isProspect ? 'پتانسیل' : 'مشتری';
      const urgency = a.urgency || 'low';
      const icon = ACTION_URGENCY_ICON[urgency] || ACTION_URGENCY_ICON.low;
      const actionText = a.action || '';
      const why = a.reason || '';
      const whyNow = a.whyNow || '';
      const href = isProspect
        ? ('#/prospect?id=' + encodeURIComponent(a.prospectId || ''))
        : ('#/customer?id=' + encodeURIComponent(a.customerId || ''));
      const lines = [];
      lines.push('<span class="action-person">' + esc(name) +
        '</span> <span class="action-badge">' + esc(badge) + '</span>');
      if (actionText) {
        lines.push('<span class="action-main">' + esc(actionText) + '</span>');
      }
      if (why) {
        lines.push('<span class="action-why"><span class="action-meta-label">چرا:</span> ' + esc(why) + '</span>');
      }
      if (whyNow) {
        lines.push('<span class="action-why-now"><span class="action-meta-label-now">الان:</span> ' + esc(whyNow) + '</span>');
      }
      return '<a class="cc-task-row action-row-' + esc(urgency) + '" href="' + href + '">' +
        '<span class="cc-task-rail action-urgency-' + esc(urgency) + '" aria-hidden="true"></span>' +
        '<span class="cc-task-body">' + lines.join('') + '</span>' +
        '<span class="cc-task-chevron" aria-hidden="true">‹</span></a>';
    }

    const visibleRows = visibleItems.map(renderRow).join('');
    let hiddenBlock = '';
    if (hiddenItems.length) {
      const hiddenRows = hiddenItems.map(renderRow).join('');
      hiddenBlock =
        '<div class="dash-action-more" data-action-more hidden>' + hiddenRows + '</div>' +
        '<button type="button" class="dash-action-toggle" data-action-toggle aria-expanded="false">' +
          '<span data-action-toggle-label>نمایش ' + hiddenItems.length + ' کار دیگر</span>' +
          '<span class="dash-action-toggle-ico" aria-hidden="true">›</span>' +
        '</button>';
    }

    const riskCount = items.filter(function (a) {
      return a && (a.urgency === 'critical' || a.urgency === 'high');
    }).length;
    const riskBadge = riskCount > 0
      ? '<span class="dash-risk-badge" title="تعداد موارد بحرانی/پراهمیت در همین لیست">' + riskCount + ' مورد مهم</span>'
      : '';

    return '<section class="cc-block"><div class="cc-block-head"><div class="cc-block-label">اقدام بعدی</div>' + (riskBadge || '') + '</div><div class="cc-task-list dash-action-queue">' + visibleRows + hiddenBlock + '</div></section>';
  }

  /* Toggles the collapsed remainder of the Action Queue (items 3-5).
     Presentation-only: does not alter which actions exist, their order, or count. */
  function bindActionQueueToggle(root) {
    const btn = root.querySelector('[data-action-toggle]');
    const more = root.querySelector('[data-action-more]');
    const label = root.querySelector('[data-action-toggle-label]');
    if (!btn || !more) return;
    const hiddenCount = more.querySelectorAll('.action-row').length;
    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        more.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('is-open');
        if (label) label.textContent = 'نمایش ' + hiddenCount + ' کار دیگر';
      } else {
        more.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        btn.classList.add('is-open');
        if (label) label.textContent = 'نمایش کمتر';
      }
    });
  }

  /* --- Watch / Early Warning + Lifecycle (additive) ---
     Generation still comes from extractWatchObservations via
     reconcileWatchLifecycle. The Dashboard no longer lists individual
     Watch rows here — it shows one compact summary card that links to
     the full Watch List (#/watches). Per-occurrence rendering now lives
     in js/views/watches.js (WatchesView / WatchDetailView), which reads
     the same existing public Watch API used below. */
  function faDigits(n) {
    return String(n).replace(/[0-9]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; });
  }

  function watchSummaryHtml() {
    var count = 0;
    var haveCount = false;

    if (typeof getWatchLifecycleSummary === 'function') {
      try {
        var summary = getWatchLifecycleSummary();
        if (summary && typeof summary.active === 'number') {
          count = summary.active;
          haveCount = true;
        }
      } catch (eS) { /* fall through to fallback below */ }
    }

    if (!haveCount && typeof extractWatchObservations === 'function' && typeof data !== 'undefined' && Array.isArray(data.customers)) {
      // Fallback when lifecycle module not loaded (mirrors prior behavior)
      var customers = data.customers.filter(function (c) { return c && c.active !== false; });
      for (var ci = 0; ci < customers.length; ci++) {
        try { count += (extractWatchObservations(customers[ci].id) || []).length; } catch (e) { /* skip */ }
      }
      haveCount = true;
    }

    if (!count) return '';

    return '<div class="dashboard-block">' + dashSectionHead(ICO.actions, 'هشدارهای زودهنگام', '', '') +
      '<a class="dash-watch-compact" href="#/watches">' +
        '<span class="dash-watch-compact-ico" aria-hidden="true">' + ICO.actions + '</span>' +
        '<span class="dash-watch-compact-body">' +
          '<span class="dash-watch-compact-count">' + faDigits(count) + ' مورد</span>' +
          '<span class="dash-watch-compact-label">هشدارهای فعال</span>' +
        '</span>' +
        '<span class="dash-watch-compact-chevron" aria-hidden="true">‹</span>' +
      '</a>' +
      '</div>';
  }

  function recentInvoicesHtml() {
    const invs = (data.invoices || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '') || String(b.number || '').localeCompare(String(a.number || ''));
    }).slice(0, 5);
    if (!invs.length) return '';
    const rows = invs.map(function (inv) {
      const cust = (data.customers || []).find(function (c) { return c.id === inv.customerId; });
      return '<a class="cc-tl-row" href="#/invoice?id=' + encodeURIComponent(inv.id) + '">' + '<span class="cc-tl-kind">فاکتور</span>' + '<span class="cc-tl-main">' + esc(cust ? cust.name : '—') + '<span class="cc-tl-sub">#' + esc(String(inv.number || '')) + ' · ' + faDate(inv.date) + '</span></span>' + '<span class="cc-tl-amt">' + money(inv.total) + '</span></a>';
    }).join('');
    return '<section class="cc-block"><div class="cc-block-head"><div class="cc-block-label">آخرین فاکتورها</div><a class="cc-block-link" href="#/invoices">همه</a></div><div class="cc-timeline">' + rows + '</div></section>';
  }

  function recentVisitsHtml() {
    const items = [];
    (data.customers || []).forEach(function (c) {
      (c.visits || []).forEach(function (v) { items.push({ customerId: c.id, name: c.name, date: v.date, time: v.time, result: v.result }); });
    });
    items.sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''); });
    const top = items.slice(0, 5);
    if (!top.length) return '';
    const rows = top.map(function (v) {
      return '<a class="cc-tl-row" href="#/customer?id=' + encodeURIComponent(v.customerId) + '">' + '<span class="cc-tl-kind">ویزیت</span>' + '<span class="cc-tl-main">' + esc(v.name) + '<span class="cc-tl-sub">' + faDate(v.date) + (v.result ? ' · ' + esc(v.result) : '') + '</span></span>' + '<span class="cc-tl-amt">›</span></a>';
    }).join('');
    return '<section class="cc-block"><div class="cc-block-head"><div class="cc-block-label">آخرین ویزیت‌ها</div><a class="cc-block-link" href="#/visits">همه</a></div><div class="cc-timeline">' + rows + '</div></section>';
  }

  function targetHtml(metrics) {
    const target = typeof getMonthlySalesTarget === 'function' ? getMonthlySalesTarget() : 0;
    const sales = Number(metrics.mtdSales) || 0;
    const pct = target > 0 ? Math.round((sales / target) * 100) : 0;
    const capped = Math.min(100, Math.max(0, pct));
    const done = target > 0 && sales >= target;

    // Figures + pace/status line: derived only from existing commandCenterMetrics
    // (jy/jm/jd) and the existing jalaliMonthLength() helper. No new data source.
    let figuresHtml = '';
    let statusRowHtml = '';
    if (target > 0) {
      figuresHtml = '<div class="cc-target-figures"><span class="cc-target-figures-num">' + toman(sales) + '</span>' +
        ' <span class="cc-target-figures-sep">از</span> ' +
        '<span class="cc-target-figures-num">' + toman(target) + '</span>' +
        ' <span class="cc-target-figures-unit">تومان</span></div>';

      if (!done) {
        const monthLen = (metrics.jy && metrics.jm && typeof jalaliMonthLength === 'function')
          ? jalaliMonthLength(metrics.jy, metrics.jm) : null;
        const remaining = Math.max(0, target - sales);
        let paceHtml = '';
        let statusMeta = null;
        if (monthLen) {
          const daysLeft = Math.max(0, monthLen - (metrics.jd || 0));
          const expectedFraction = Math.min(1, (metrics.jd || 0) / monthLen);
          const expectedSales = target * expectedFraction;
          if (sales >= expectedSales * 1.05) statusMeta = { cls: 'ahead', icon: '↑', text: 'جلوتر از برنامه' };
          else if (sales <= expectedSales * 0.95) statusMeta = { cls: 'behind', icon: '⚠', text: 'عقب‌تر از برنامه' };
          else statusMeta = { cls: 'ontrack', icon: '✓', text: 'روی برنامه' };
          if (daysLeft > 0) {
            const requiredDaily = Math.round(remaining / daysLeft);
            paceHtml = '<span class="cc-target-pace">نیاز روزانه ' + toman(requiredDaily) + ' ت' +
              ' <span class="cc-target-pace-days">(' + daysLeft + ' روز مانده)</span></span>';
          }
        }
        if (statusMeta) {
          statusRowHtml = '<div class="cc-target-status">' +
            '<span class="cc-target-chip cc-target-' + statusMeta.cls + '">' + statusMeta.icon + ' ' + statusMeta.text + '</span>' +
            paceHtml +
            '</div>';
        }
      }
    }

    return (
      '<div class="cc-target-wrap">' +
        '<div class="cc-target-edit-row">' +
          '<button type="button" class="cc-target-edit" data-monthly-target aria-label="تنظیم هدف فروش">' +
            ICO.target +
          '</button>' +
        '</div>' +
        '<div class="cc-target ' + (done ? 'is-done' : '') + '">' +
          '<div class="cc-target-top">' +
            '<div class="cc-target-heading">' +
              '<span class="cc-target-growth" aria-hidden="true">' + ICO.growth + '</span>' +
              '<span class="cc-target-title">هدف فروش این ماه</span>' +
            '</div>' +
          '</div>' +
          figuresHtml +
          '<div class="cc-target-row">' +
            '<div class="cc-target-progress"><div class="cc-target-bar"><span style="width:' + capped + '%"></span></div></div>' +
            '<span class="cc-target-pct">' + (target > 0 ? pct + '٪' : '—') + '</span>' +
          '</div>' +
          statusRowHtml +
        '</div></section>');
  }

  function bindMonthlyTarget(root, refresh) {
    const btn = root.querySelector('[data-monthly-target]');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      const current = typeof getMonthlySalesTarget === 'function' ? getMonthlySalesTarget() : 0;
      openSheet(
        '<div class="sheet-title">هدف فروش این ماه</div>' +
        '<div class="field"><label>مبلغ هدف (تومان)</label>' +
        '<input id="monthly-target-input" type="text" inputmode="decimal" autocomplete="off" value="' + (current ? formatAmountForInput(current) : '') + '">' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">' +
        '<button type="button" class="btn" id="monthly-target-cancel">انصراف</button>' +
        '<button type="button" class="btn primary" id="monthly-target-save">ذخیره</button>' +
        '</div>'
      );
      const input = document.getElementById('monthly-target-input');
      if(input && typeof reformatAmountInputEl === 'function') reformatAmountInputEl(input);
      if(input) input.focus();
      const save = document.getElementById('monthly-target-save');
      const cancel = document.getElementById('monthly-target-cancel');
      if(cancel) cancel.addEventListener('click', closeModal);
      if(save) save.addEventListener('click', function(){
        const raw = input ? input.value : '';
        const normalized = normalizeDigits(raw).replace(/[,_\s٬]/g, '');
        const value = Number(normalized);
        if (!(value > 0)) { if (typeof showToast === 'function') showToast('هدف باید بیشتر از صفر باشد'); return; }
        if (typeof setMonthlySalesTarget === 'function') setMonthlySalesTarget(value);
        closeModal();
        refresh();
      });
    });
  }

  function formatAmountForInput(value){
    try { return Number(value).toLocaleString('fa-IR'); } catch(e) { return String(value || ''); }
  }


  /* ---- PASS 2: Command Center attention + today strip (UI only; existing data) ---- */
  function attentionHtml() {
    var items = [];
    try {
      if (typeof checksDueSoon === 'function') {
        var due = checksDueSoon() || [];
        if (due.length) {
          items.push({ href: '#/checks?filter=dueSoon', sev: 'warn', mark: '!', label: due.length + ' چک نزدیک سررسید', sub: 'نیاز به پیگیری' });
        }
      }
    } catch (e) {}
    try {
      if (typeof lowStockProducts === 'function') {
        var low = lowStockProducts() || [];
        if (low.length) {
          items.push({ href: '#/products', sev: 'danger', mark: '▲', label: low.length + ' کالای رو به اتمام', sub: 'بررسی موجودی' });
        }
      }
    } catch (e) {}
    try {
      var wCount = 0;
      if (typeof getWatchLifecycleSummary === 'function') {
        var s = getWatchLifecycleSummary();
        if (s && typeof s.active === 'number') wCount = s.active;
      } else if (typeof getActiveWatchOccurrences === 'function') {
        wCount = (getActiveWatchOccurrences() || []).length;
      }
      if (wCount > 0) {
        items.push({ href: '#/watches', sev: 'watch', mark: '●', label: wCount + ' هشدار فعال', sub: 'نیاز به توجه' });
      }
    } catch (e) {}
    try {
      var g = globalTotals();
      var debtors = typeof debtorList === 'function' ? debtorList(9999) : [];
      if (g && g.customerDebt > 0 && debtors.length) {
        items.push({ href: '#/customers?filter=debt', sev: 'debt', mark: '●', label: debtors.length + ' مشتری بدهکار', sub: toman(Math.round(g.customerDebt)) + ' ت' });
      }
    } catch (e) {}
    if (!items.length) return '';
    var rows = items.slice(0, 5).map(function (it) {
      return '<a class="cc-prio-row cc-prio-' + it.sev + '" href="' + it.href + '">' +
        '<span class="cc-prio-rail" aria-hidden="true"></span>' +
        '<span class="cc-prio-mark" aria-hidden="true">' + esc(it.mark) + '</span>' +
        '<span class="cc-prio-body"><span class="cc-prio-label">' + esc(it.label) + '</span>' +
        (it.sub ? '<span class="cc-prio-sub">' + esc(it.sub) + '</span>' : '') + '</span>' +
        '<span class="cc-prio-chevron" aria-hidden="true">‹</span></a>';
    }).join('');
    return '<section class="cc-block"><div class="cc-block-label">اولویت امروز</div><div class="cc-prio-list">' + rows + '</div></section>';
  }

  function todayStripHtml(g, metrics) {
    var todaySales = (g && g.todaySales != null) ? g.todaySales : 0;
    var todayCount = (g && g.todayCount != null) ? g.todayCount : 0;
    var monthSales = (metrics && metrics.mtdSales != null) ? metrics.mtdSales : ((g && g.monthSales) || 0);
    return '<section class="cc-hero">' +
      '<div class="cc-hero-kicker">امروز</div>' +
      '<div class="cc-hero-value">' + money(todaySales) + '</div>' +
      '<div class="cc-hero-meta">' +
        (todayCount ? (todayCount + ' فاکتور · فروش امروز') : 'هنوز فروشی ثبت نشده') +
        ' · ماه: ' + money(monthSales) +
      '</div></section>';
  }

  async function renderInto(root, isStale) {
    // Lifecycle reconcile before painting Watch summary (additive; fail-open)
    if (typeof reconcileWatchLifecycle === 'function') {
      try { await reconcileWatchLifecycle(); } catch (eRec) { console.warn('watch lifecycle reconcile failed', eRec); }
    }
    const metrics = typeof commandCenterMetrics === 'function' ? commandCenterMetrics(new Date()) : { mtdSales: globalTotals().monthSales, mtdProfit: 0, salesDeltaPct: null, profitDeltaPct: null };
    const g = globalTotals();
    const invVal = inventoryValue();
    if (typeof isStale === 'function' && isStale()) return;

    // PASS 2 hierarchy: Today → Attention → Next action → Target → Snapshot → Quick → Recent
    // Watch summary absorbed into attention when count>0; keep compact card only if attention empty
    var attn = attentionHtml();
    var watchBlock = attn ? '' : watchSummaryHtml();
    root.innerHTML =
      '<div class="dashboard-shell">' +
      todayStripHtml(g, metrics) +
      attn +
      todaysActionsHtml() +
      targetHtml(metrics) +
      watchBlock +
      '<section class="cc-block">' +
        '<div class="cc-block-head"><div class="cc-block-label">نمای کسب‌وکار</div><a class="cc-block-link" href="#/reports">گزارش‌ها</a></div>' +
        '<div class="cc-scoreboard">' +
          '<a class="cc-sb-cell" href="#/reports"><span class="cc-sb-label">فروش ماه</span><span class="cc-sb-value cc-sb-sales">' + money(metrics.mtdSales) + '</span><span class="cc-sb-delta">' + deltaHtml(metrics.salesDeltaPct) + '</span></a>' +
          '<div class="cc-sb-cell"><span class="cc-sb-label">سود ماه</span><span class="cc-sb-value cc-sb-profit">' + money(metrics.mtdProfit) + '</span><span class="cc-sb-delta">' + deltaHtml(metrics.profitDeltaPct) + '</span></div>' +
          '<a class="cc-sb-cell" href="#/customers?filter=debt"><span class="cc-sb-label">بدهی</span><span class="cc-sb-value cc-sb-debt">' + money(g.customerDebt) + '</span><span class="cc-sb-delta">' + debtorList(9999).length + ' بدهکار</span></a>' +
        '</div>' +
        '<div class="cc-sb-foot">موجودی انبار · ' + money(invVal) + '</div>' +
      '</section>' +
      quickActionsHtml() +
      recentInvoicesHtml() + recentVisitsHtml() +
      '</div>';

    bindMonthlyTarget(root, function () { renderInto(root, isStale); });
    bindActionQueueToggle(root);
    bindQuickActions(root);
  }

  function mount(root, params) {
    if (!root) return function () {};
    const nav = document.getElementById('nav');
    if (nav) nav.style.display = 'none';
    let cancelled = false;
    let refreshToken = null;
    const isStale = function () { return cancelled; };
    function refreshDashboard() {
      // Lightweight placeholder while watch lifecycle reconciles (OPP-06)
      if (root && !root.querySelector('.dashboard-shell') && !root.querySelector('.dash-loading')) {
        root.innerHTML = '<div class="dash-loading empty" style="padding:28px 14px;text-align:center;">در حال آماده‌سازی داشبورد…</div>';
      }
      renderInto(root, isStale).catch(function (e) { if (!cancelled) console.error('DashboardView refresh failed', e); });
    }
    refreshDashboard();
    if (typeof ViewHost !== 'undefined' && ViewHost.setRefresh) refreshToken = ViewHost.setRefresh(refreshDashboard);
    return function unmount() {
      cancelled = true;
      if (typeof ViewHost !== 'undefined' && ViewHost.clearRefresh) ViewHost.clearRefresh(refreshToken);
      refreshToken = null;
      if (nav) nav.style.display = '';
      root.innerHTML = '';
    };
  }

  global.DashboardView = { mount: mount, unmount: function () {} };
})(typeof window !== 'undefined' ? window : this);