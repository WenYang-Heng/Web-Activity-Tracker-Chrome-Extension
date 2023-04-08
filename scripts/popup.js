let keys = [];
let index;
const ctx = document.getElementById('myChart').getContext('2d');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const todayBtn = document.getElementById('today');
const weeklyBtn = document.getElementById('weekly');

const option = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: false
    },
  },
}

chrome.storage.local.get(null, function(result){
  keys = Object.keys(result);
  index = keys.length - 1;
  dailyChart();
});

function dailyChart(){
  let currentDate = keys[index];
  chrome.storage.local.get(currentDate, function(result) {
    // check if data exists for this day
    if (result.hasOwnProperty(currentDate)) {
      let canvas  = Chart.getChart("myChart");

      //Charts have to be destroyed before creating another one
      if(canvas != undefined){
        canvas.destroy();
      }

      let totalTime = 0;
      let stats = result[currentDate];
      const domain = [];
      const timeSpent = [];

      for(let i = 0; i < stats.length; i++){
        domain.push(stats[i].domain);
        timeSpent.push(stats[i].totalTime);
        totalTime += stats[i].totalTime;
      }
      console.log(convertTime(totalTime));
      console.log(timeSpent);

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
        options: option,
      });
    } else {
      // display a message if no data exists for this day
      console.log("No data available for this day.");
    }
  });  
}

function weeklyChart(){
  chrome.storage.local.get(null, function(result){
    console.log(result);
    const date = [];
    const totalTime = [];
    for(let dateKey in result){
      let data = result[dateKey];
      console.log(dateKey);
      date.push(dateKey);
      let dailySum = 0;
      for(let i = 0; i < data.length; i++){
        console.log(data[i].domain, data[i].totalTime);
        dailySum += data[i].totalTime;
      }
      console.log(dailySum);
      totalTime.push(dailySum);
    }

    let canvas  = Chart.getChart("myChart");

    if(canvas != undefined){
      canvas.destroy();
    }

    const myChart = new Chart(ctx, {
      type: 'bar',
      data:{
        labels: date,
        datasets: [{
          label: 'Total time spent for each day',
          data: totalTime,
          backgroundColor: 'rgba(251, 41, 41, 0.8)',
          borderColor: 'rgba(251, 41, 41, 0.8)',
          borderWidth: 0,
          barThickness: 45
        }],
      },
      options: option
    });
  });
}

leftBtn.addEventListener('click', function(){
  index--;
  if(index < 0){
    index = keys.length - 1;
  }
  dailyChart();
});

rightBtn.addEventListener('click', function(){
  index++;
  if(index > keys.length - 1){
    index = 0;
  }
  dailyChart();
});

todayBtn.addEventListener('click', function(){
  index = keys.length - 1;
  dailyChart();
});

weeklyBtn.addEventListener('click', function(){
  weeklyChart();
});
