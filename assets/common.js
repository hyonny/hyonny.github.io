$(document).ready(function() {
  init();
  focus();

  $(`#console`)
    .hover(
      function() { $(this).animate({ opacity: 1.0 }, { duration: 100 }); },
      function() { $(this).animate({ opacity: 0.8 }, { duration: 100 }); }
    )
    .click(function() { focus(); });

  $(`#prompt`).submit(function(event) {
    event.preventDefault();
    let input = $(this).find(`input[name="text"]`);
    $(`<p class="history">`).text(input.val()).appendTo(`#histories`);
    displayResult(input.val());
    input.val(``);
    $(`#console`).scrollTop(99999);
  });

  $(`table.skill tbody tr`).each(function(i, elm) {
    let tr = $(elm);
    // rate
    if (tr.data(`rate`)) {
      $(`<td class="rate">`).append(`<span class="star-filled" style="width: ${13 * Number(tr.data(`rate`))}pt">★★★★★</span>`)
                            .append(`<span class="star-empty">☆☆☆☆☆</span>`)
                            .appendTo(tr);
    } else { $(`<td>`).appendTo(tr); }
    // 年数
    $(`<td class="datetime">`).text(tr.data(`datetime-fixed`)).appendTo(tr);
    // 業務経験
    $(`<td class="work">`).text(tr.data(`work`)).appendTo(tr);

    $(`<td>`).appendTo(tr);
  });

  setInterval(setDatetime, 1000);
});

function init() {
  $(`#content section`).hide();
  $(`#content #sicanic`).show();
  $(`#histories`).empty();
}

function focus() {
  $(`#prompt`).find(`input[name="text"]`).focus();
  $(`#console`).scrollTop(99999);
}

function displayResult(command) {
  let elms = [];
  $.each(command.split(` `), function(i, elm) {
    if (elm != ``) elms.push(elm);
  });
  let result = $(`<p class="history result">`);
  switch (elms[0]) {
    case ``, undefined:
      // noop
      break;
    case `help`:
      $(`.first`).hide();
      result.html(
        `<pre><code>  Usage:

    show &lt;Type&gt;     Display contents. ( Type: "skill", "other", "sicanic", ... )
    clear           Clear all.</code></pre>`
      ).appendTo(`#histories`);
      break;
    case `show`:
      commandShow(elms[1]);
      break;
    case `clear`:
      init();
      break;
    case `reload`:
      location.reload();
      break;
    default:
      result.text(`${elms[0]}: command not found`).appendTo(`#histories`);
  }
}

function commandShow(type) {
  switch (type) {
    case `skill`:
    case `other`:
    case `sicanic`:
      $(`#content section`).hide();
      $(`#content #${type}`).show();
      break;
    default:
      // noop
  }
}

function setDatetime() {
  $(`table.skill tbody tr`).each(function(i, elm) {
    let tr = $(elm);
    if (tr.data(`datetime`)) {
      // リアルタイム計算
      from = new Date(tr.data(`datetime`));
      now = new Date();
      tr.find(`td.datetime`).text(calcDatetimeDiff(from, now));
    }
  });
}

function calcDatetimeDiff(from, now) {
  let text = ``;
  year = 0; month = 0; date = 0; hour = 0; minute = 0; second = 0;

  // 秒
  second = now.getSeconds() - from.getSeconds();
  if (second < 0) {
    second = 60 + second;
    minute = 1;
  }
  text = `${second}秒`;
  // 分
  minute = now.getMinutes() - from.getMinutes() - minute;
  if (minute < 0) {
    minute = 60 + minute;
    hour = 1;
  }
  text = `${minute}分${text}`
  // 時間
  hour = now.getHours() - from.getHours() - hour;
  if (hour < 0) {
    hour = 24 + hour;
    date = 1;
  }
  text = `${hour}時間${text}`
  // 日
  date = now.getDate() - from.getDate() - date;
  if (date < 0) {
    switch (from.getMonth() + 1) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        date = 31 + date;
        break;
      case 4:
      case 6:
      case 9:
      case 11:
        date = 30 + date;
        break;
      case 2:
        switch (from.getYear() % 4) {
          case 0:
            if (from.getYear() % 100 == 0) {
              date = 28 + date;
            } else {
              date = 29 + date;
            }
            break;
          default:
            date = 28 + date;
        }
        break;
    }
    month = 1;
  }
  text = `${date}日${text}`
  // 月
  month = now.getMonth() - from.getMonth() - month;
  if (month < 0) {
    month = 12 + month;
    year = 1;
  }
  text = `${month}ヶ月${text}`
  // 年
  year = now.getYear() - from.getYear() - year;
  text = `${year}年${text}`

  return text;
}
