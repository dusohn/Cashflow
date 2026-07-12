/**
 * 법인 운영 Cashflow — Google Sheets 연동 API
 * 이 코드를 구글 시트의 Apps Script(확장 프로그램 → Apps Script)에 붙여넣고
 * "웹 앱"으로 배포하세요. (실행: 나, 액세스: 모든 사용자)
 *
 * 데이터는 시트 탭 4개(Transactions / Recurring / DebtInvest / Settings)에
 * 엑셀과 같은 구조로 저장되므로, 시트에서 직접 열어 볼 수도 있습니다.
 * 단, 시트를 직접 수정하기보다 웹 앱에서 입력하는 것을 권장합니다.
 */

var NAMES = { transactions:'Transactions', recurring:'Recurring', debtinvest:'DebtInvest' };

var FIELDS = {
  transactions:['id','date','actual','type','cat','item','party','supply','vat','status','pay','memo'],
  recurring:   ['id','cat','name','party','start','end','amount','vatIncl','payday','status','memo'],
  debtinvest:  ['id','date','cat','item','party','amount','status','asset','proof','memo']
};
var HEADERS = {
  transactions:['id','입출금 예정일','실제일','구분','대분류','세부항목','거래처','공급가(원)','부가세(원)','상태','결제수단','메모'],
  recurring:   ['id','대분류','항목명','지급처/대상','시작일','종료일','월금액(원)','부가세 포함?','지급일','상태','메모'],
  debtinvest:  ['id','예정일','구분','세부항목','거래처/기관','금액(원)','상태','관련 자산/대출','증빙','메모']
};
var SETTING_KEYS = ['startMonth','openingCash','minBuffer','taxMemo','basis'];

function doGet() {
  return json_(readAll_());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.all) {
      writeSettings_(body.all.settings || {});
      for (var k in NAMES) writeTable_(k, body.all[k] || []);
    } else if (body.key === 'settings') {
      writeSettings_(body.data || {});
    } else if (FIELDS[body.key]) {
      writeTable_(body.key, body.data || []);
    } else {
      return json_({ status:'error', message:'unknown key' });
    }
    return json_({ status:'ok' });
  } catch (err) {
    return json_({ status:'error', message:String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------- 내부 함수 ----------

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function cell_(v, monthOnly) {
  if (v instanceof Date) {
    var fmt = monthOnly ? 'yyyy-MM' : 'yyyy-MM-dd';
    return Utilities.formatDate(v, Session.getScriptTimeZone(), fmt);
  }
  return v === null || v === undefined ? '' : v;
}

function readAll_() {
  var out = {};
  // Settings (구분 | 입력값)
  var sv = sheet_('Settings').getDataRange().getValues();
  var s = {}, hasSettings = false;
  for (var i = 0; i < sv.length; i++) {
    if (sv[i][0] && SETTING_KEYS.indexOf(String(sv[i][0])) >= 0) {
      s[String(sv[i][0])] = sv[i][1];
      hasSettings = true;
    }
  }
  out._hasSettings = hasSettings;
  out.settings = {
    startMonth: String(cell_(s.startMonth, true) || '2026-08').slice(0, 7),
    openingCash: Number(s.openingCash) || 0,
    minBuffer: Number(s.minBuffer) || 0,
    taxMemo: String(s.taxMemo || ''),
    basis: String(s.basis || '현금주의')
  };
  // 테이블 3종
  for (var key in NAMES) {
    var vals = sheet_(NAMES[key]).getDataRange().getValues();
    var rows = [];
    for (var r = 1; r < vals.length; r++) {
      if (!vals[r][0]) continue; // id 없는 행 무시
      var obj = {};
      for (var c = 0; c < FIELDS[key].length; c++) obj[FIELDS[key][c]] = cell_(vals[r][c]);
      rows.push(obj);
    }
    out[key] = rows;
  }
  return out;
}

function writeTable_(key, rows) {
  var sh = sheet_(NAMES[key]);
  sh.clearContents();
  var data = [HEADERS[key]];
  for (var i = 0; i < rows.length; i++) {
    var line = [];
    for (var c = 0; c < FIELDS[key].length; c++) {
      var v = rows[i][FIELDS[key][c]];
      line.push(v === null || v === undefined ? '' : v);
    }
    data.push(line);
  }
  var rng = sh.getRange(1, 1, data.length, HEADERS[key].length);
  rng.setNumberFormat('@'); // 날짜가 자동 변환되지 않도록 텍스트 서식
  rng.setValues(data);
  sh.setFrozenRows(1);
}

function writeSettings_(s) {
  var sh = sheet_('Settings');
  sh.clearContents();
  var data = [
    ['구분', '입력값'],
    ['startMonth', s.startMonth || ''],
    ['openingCash', s.openingCash || 0],
    ['minBuffer', s.minBuffer || 0],
    ['taxMemo', s.taxMemo || ''],
    ['basis', s.basis || '현금주의']
  ];
  var rng = sh.getRange(1, 1, data.length, 2);
  rng.setNumberFormat('@');
  rng.setValues(data);
  sh.setFrozenRows(1);
}
