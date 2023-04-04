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