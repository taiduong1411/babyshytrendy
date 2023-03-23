// lấy các ngày trong tháng. Có tháng sẽ có 31 hoặc 30, tháng 2 sẽ có 28 hoặc 29 ngày !
// function getDaysInCurrentMonth() {
//     const date = new Date();
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
// }

// const result = getDaysInCurrentMonth();

// var DayOfMonth = []
// for (var i = 1; i < result + 1; i++) {
//     DayOfMonth.push(i);
// }
// Lấy các ngày trong tuần
// const dayOfWeekName = new Date().toLocaleString(
//     'default', { weekday: 'long' }
// );
// const dayCurr = 20
// const monthCurr = new Date().getMonth() + 1
// const yearCurr = new Date().getFullYear()
//     // alert(yearCurr)
// var DayOfWeek = []
// for (var j = dayCurr; j < dayCurr + 7; j++) {
//     if (j < result + 1) {
//         DayOfWeek.push(j + '/' + monthCurr + '/' + yearCurr);
//     } else {
//         DayOfWeek.push((j - result) + '/' + (monthCurr + 1) + '/' + yearCurr)
//     }
// }
//Nhan value tu BE
// var data_week = []
// for (var k = 0; k < DayOfWeek.length; k++) {
//     let object = {
//         day: DayOfWeek[k],
//         count: 1
//     }
//     data_week.push(object)
// }
// console.log(data_week);
document.addEventListener("DOMContentLoaded", () => {
    $.ajax({
        url: "http://localhost:3000/admin/data",
        method: "get",
        data: {},
        success: (data_week) => {
            const order_total = data_week.map(object => {
                return object.order_total;
            });
            var order_total_max = Math.max(...order_total)
            if (order_total_max % 2 != 0) {
                var order_total_max = order_total_max + 3
            } else {
                var order_total_max = order_total_max + 4
            }
            var barColors = ["#1a34", "#CCD5AE", "#C9EEFF", "#FFACAC", "#BFACE2", "#FFEA20", "#F273E6"];
            new Chart(
                document.getElementById('myChartWeek'), {
                    type: 'bar',
                    options: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "Order by week"
                        },
                        scales: {
                            yAxes: [{ ticks: { min: 0, max: order_total_max } }]
                        },
                    },
                    data: {
                        labels: data_week.map(row => row.day),
                        datasets: [{
                            backgroundColor: barColors,
                            data: data_week.map(row => row.order_total)
                        }]
                    }

                }
            );
        }
    });
});