let keys = [];
let index;

chrome.storage.local.get(null, function(result){
  keys = Object.keys(result);
  index = keys.length - 1;
  updateChart();
});

const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

// get the data for a specific day
function updateChart(){
  let currentDate = keys[index];
  chrome.storage.local.get(currentDate, function(result) {
    // check if data exists for this day
    if (result.hasOwnProperty(currentDate)) {
      const ctx = document.getElementById('myChart').getContext('2d');
      let canvas  = Chart.getChart("myChart");

      //Charts have to be destroyed before creating another one
      if(canvas != undefined){
        canvas.destroy();
      }

      let stats = result[currentDate];
      const domain = [];
      const timeSpent = [];

      for(let i = 0; i < stats.length; i++){
        domain.push(stats[i].domain);
        timeSpent.push(stats[i].totalTime);
      }

      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: domain,
          datasets:[{
            label: currentDate,
            data: timeSpent,
            backgroundColor: 'rgba(251, 41, 41, 0.8)',
            borderColor: 'rgba(251, 41, 41, 0.8)',
            borderWidth: 0,
            barThickness: 45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: false
            },
          }
        }
      });
    } else {
      // display a message if no data exists for this day
      console.log("No data available for this day.");
    }
  });  
}

leftBtn.addEventListener('click', function(){
  index--;
  if(index < 0){
    index = keys.length - 1;
  }
  updateChart();
});

rightBtn.addEventListener('click', function(){
  index++;
  if(index > keys.length - 1){
    index = 0;
  }
  updateChart();
});
