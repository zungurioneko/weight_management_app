document.addEventListener('turbolinks:load', () => {
  if (document.getElementById('start-calendar')) {
    // ********** 一番上の方に，以下を追加 **********
    // 日付の古い方・新しい方を取得する関数
    const minDate = (date1, date2) => (date1 < date2) ? date1 : date2
    const maxDate = (date1, date2) => (date1 > date2) ? date1 : date2

    // '2020-01-12'のような文字列から，Javascriptの日付オブジェクトを取得する関数
    // setHoursを使用しないと，時差の影響で0時にならないため注意！
    const convertDate = (date) => new Date(new Date(date).setHours(0, 0, 0, 0))

    // データの初日・最終日
    const START_DATE = convertDate(gon.weight_records[0].date)
    const END_DATE = convertDate(gon.weight_records[gon.weight_records.length - 1].date)

    // ********** 以下を追加 **********
    // カレンダーの日本語化
    flatpickr.localize(flatpickr.l10ns.ja)

    // ********** 以下を追加 **********
    const drawGraphForPeriod = () => {
      let from = convertDate(document.getElementById('start-calendar').value)
      let to = convertDate(document.getElementById('end-calendar').value)

      if (from > to) {
        alert('終了日は開始日以降の日付に設定して下さい')
      } else {
        drawGraph(from, to)
      }
    }
    // ********** 以上を追加 **********

    const periodCalendarOption = {
      // スマートフォンでもカレンダーに「flatpickr」を使用
      disableMobile: true,
      // 選択できる期間を設定
      minDate: START_DATE,
      maxDate: END_DATE,
      // 日付選択後のイベント
      // onChange: （後で記述）
    }

    // カレンダー
    const startCalendarFlatpickr = flatpickr('#start-calendar', periodCalendarOption)
    const endCalendarFlatpickr = flatpickr('#end-calendar', periodCalendarOption)
    // ********** 以上を追加 **********

    const TODAY = convertDate(new Date())
    const A_WEEK_AGO = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 6)
    const TWO_WEEKS_AGO = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 13)
    const A_MONTH_AGO = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, TODAY.getDate() + 1)
    const THREE_MONTHS_AGO = new Date(TODAY.getFullYear(), TODAY.getMonth() - 3, TODAY.getDate() + 1)

    // ********** 他のカレンダーの下に追加 **********
    // 新規登録用のカレンダー
    flatpickr('#new-calendar', {
      disableMobile: true,
      // 記録のある日付を選択できないようにする
      disable: gon.recorded_dates,
      defaultDate: 'today',
    })

    // グラフを描く場所を取得
    const chartWeightContext = document.getElementById("chart-weight").getContext('2d')

    // ********** drawGraph関数より上に，以下を追加 **********
    // 関数内で変数宣言をするとローカル変数となり，関数の外で消えてしまう
    // drawGraph 関数の外で変数宣言をしなければならない!
    let chartWeight
    // ********** 以上を追加 **********

    // 期間を指定してグラフを描く
    const drawGraph = (from, to) => {
      // from から to までの期間のデータに絞る
      let records = gon.weight_records.filter((record) => {
        let date = convertDate(record.date)
        return from <= date && date <= to
      })

      // 日付のみのデータを作成
      let dates = records.map((record) => {
        // 横軸のラベル表示は簡潔にしたいので，
        // 日付 2020-01-08 を 1/8 のような形式に変換する
        return record.date.replace(/^\d+-0*(\d+)-0*(\d+)$/, '$1/$2')
      })

      // 体重のみのデータを作成
      let weights = records.map((record) => record.weight)

      let weightData = {
        labels: dates,
        datasets: [{
          label: '体重(kg)',
          data: weights,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          spanGaps: true
        }]
      }

      let weightOption = {
        tooltips: {
          callbacks: {
            // ホバー（スマホならタップ）時のラベル表示を変更
            title: function (tooltipItems) {
              return tooltipItems[0].xLabel.replace(/^(\d+).(\d+)$/, ' $1 月 $2 日')
            },
            label: function (tooltipItem) {
              return '体重: ' + tooltipItem.yLabel + 'kg'
            }
          }
        }
      }

      // ********** new Chart() の部分を次に置き換える **********
      // 次の部分は削除
      // new Chart(chartWeightContext, {
      //     type: 'line',
      //     data: weightData,
      //     options: weightOption
      // })

      if (!chartWeight) {
        // グラフが存在しないときは，作成する
        chartWeight = new Chart(chartWeightContext, {
          type: 'line',
          data: weightData,
          options: weightOption
        })
      } else {
        // グラフが存在するときは，更新する
        chartWeight.data = weightData
        chartWeight.options = weightOption
        chartWeight.update()
      }
      // ********** 以上を編集 **********
    }

    // 引数の日付から今日までのグラフを描く関数
    const drawGraphToToday = (from) => {
      // データが存在する範囲に修正
      from = maxDate(from, START_DATE)
      let to = minDate(TODAY, END_DATE)
      drawGraph(from, to)
      // ********** 以下を追加 **********
      // フォームの開始日・終了日を変更する
      startCalendarFlatpickr.setDate(from)
      endCalendarFlatpickr.setDate(to)
      // ********** 以上を追加 **********
    }

    // 過去◯週間のグラフを描くボタン
    document.getElementById('a-week-button').addEventListener('click', () => {
      drawGraphToToday(A_WEEK_AGO)
    })

    document.getElementById('two-weeks-button').addEventListener('click', () => {
      drawGraphToToday(TWO_WEEKS_AGO)
    })

    document.getElementById('a-month-button').addEventListener('click', () => {
      drawGraphToToday(A_MONTH_AGO)
    })

    document.getElementById('three-months-button').addEventListener('click', () => {
      drawGraphToToday(THREE_MONTHS_AGO)
    })

    // グラフの初期表示
    drawGraphToToday(A_WEEK_AGO)

    // 編集モーダルで日付を選択したときに，記録された体重を表示する関数
    const editCalendar = document.getElementById('edit-calendar')
    const editWeight = document.getElementById('edit-weight')
    const inputWeight = () => {
      let record = gon.weight_records.find((record) => record.date === editCalendar.value)
      editWeight.value = record.weight
    }

    // 記録編集用のカレンダー
    flatpickr('#edit-calendar', {
      disableMobile: true,
      // 記録のある日付のみ選択できるようにする
      enable: gon.recorded_dates,
      // 記録が無い場合は日付を選択できないようにする
      noCalendar: gon.recorded_dates.length === 0,
      onChange: inputWeight
    })
  }
})